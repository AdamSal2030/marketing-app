// src/lib/pricing-models.ts
import db from './db';

export interface PricingFactor {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface PricingFactorRule {
  id: number;
  factor_id: number;
  min_price: number;
  max_price: number | null;  // Changed from optional to nullable
  addition_type: 'fixed' | 'percentage';
  addition_value: number;
  created_at: Date;
}

export interface UserPricingFactor {
  id: number;
  user_id: number;
  factor_id: number;
  assigned_by?: number;
  assigned_at: Date;
}

export class PricingFactorModel {
  // Get all pricing factors
  static async getAll(): Promise<PricingFactor[]> {
    const result = await db.query(`
      SELECT pf.*, u.email as created_by_email 
      FROM pricing_factors pf
      LEFT JOIN users u ON pf.created_by = u.id
      WHERE pf.is_active = true
      ORDER BY pf.name
    `);
    return result.rows;
  }

  // Get factor by ID with rules
  static async getById(id: number): Promise<{ factor: PricingFactor; rules: PricingFactorRule[] } | null> {
    const factorResult = await db.query('SELECT * FROM pricing_factors WHERE id = $1', [id]);
    if (factorResult.rows.length === 0) return null;

    const rulesResult = await db.query(`
      SELECT * FROM pricing_factor_rules 
      WHERE factor_id = $1 
      ORDER BY min_price ASC
    `, [id]);

    return {
      factor: factorResult.rows[0],
      rules: rulesResult.rows
    };
  }

  // Create new pricing factor
  static async create(data: {
    name: string;
    description?: string;
    created_by: number;
    rules: Array<{
      min_price: number;
      max_price: number | null;  // Changed from optional to nullable
      addition_type: 'fixed' | 'percentage';
      addition_value: number;
    }>;
  }): Promise<PricingFactor> {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Create factor
      const factorResult = await client.query(`
        INSERT INTO pricing_factors (name, description, created_by, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING *
      `, [data.name, data.description, data.created_by]);
      
      const factor = factorResult.rows[0];
      
      // Create rules
      for (const rule of data.rules) {
        await client.query(`
          INSERT INTO pricing_factor_rules (factor_id, min_price, max_price, addition_type, addition_value)
          VALUES ($1, $2, $3, $4, $5)
        `, [factor.id, rule.min_price, rule.max_price, rule.addition_type, rule.addition_value]);
      }
      
      await client.query('COMMIT');
      return factor;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update pricing factor
  static async update(id: number, data: {
    name: string;
    description?: string;
    rules: Array<{
      min_price: number;
      max_price: number | null;  // Changed from optional to nullable
      addition_type: 'fixed' | 'percentage';
      addition_value: number;
    }>;
  }): Promise<void> {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Update factor
      await client.query(`
        UPDATE pricing_factors 
        SET name = $1, description = $2, updated_at = NOW()
        WHERE id = $3
      `, [data.name, data.description, id]);
      
      // Delete existing rules
      await client.query('DELETE FROM pricing_factor_rules WHERE factor_id = $1', [id]);
      
      // Create new rules
      for (const rule of data.rules) {
        await client.query(`
          INSERT INTO pricing_factor_rules (factor_id, min_price, max_price, addition_type, addition_value)
          VALUES ($1, $2, $3, $4, $5)
        `, [id, rule.min_price, rule.max_price, rule.addition_type, rule.addition_value]);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete pricing factor
  static async delete(id: number): Promise<void> {
    await db.query('UPDATE pricing_factors SET is_active = false WHERE id = $1', [id]);
  }

  // Get user's assigned factor
  static async getUserFactor(userId: number): Promise<{ factor: PricingFactor; rules: PricingFactorRule[] } | null> {
    const result = await db.query(`
      SELECT pf.* FROM pricing_factors pf
      JOIN user_pricing_factors upf ON pf.id = upf.factor_id
      WHERE upf.user_id = $1 AND pf.is_active = true
    `, [userId]);

    if (result.rows.length === 0) {
      // Return default factor if no specific factor assigned
      return this.getById(1); // Assuming factor ID 1 is default
    }

    return this.getById(result.rows[0].id);
  }

  // Assign factor to user
  static async assignToUser(userId: number, factorId: number, assignedBy: number): Promise<void> {
    await db.query(`
      INSERT INTO user_pricing_factors (user_id, factor_id, assigned_by, assigned_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET factor_id = $2, assigned_by = $3, assigned_at = NOW()
    `, [userId, factorId, assignedBy]);
  }

  // Calculate price based on factor rules
  static calculatePrice(originalPrice: number, rules: PricingFactorRule[]): number {
    for (const rule of rules) {
      const withinMinRange = originalPrice >= rule.min_price;
      const withinMaxRange = rule.max_price === null || originalPrice <= rule.max_price;
      
      if (withinMinRange && withinMaxRange) {
        if (rule.addition_type === 'fixed') {
          return originalPrice + rule.addition_value;
        } else {
          return originalPrice + (originalPrice * rule.addition_value / 100);
        }
      }
    }
    
    // If no rule matches, return original price
    return originalPrice;
  }
}

export class UserFactorModel {
  // Get all users with their assigned factors
  static async getAllUsersWithFactors(): Promise<any[]> {
    const result = await db.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        pf.id as factor_id,
        pf.name as factor_name,
        upf.assigned_at,
        assigned_by_user.email as assigned_by_email
      FROM users u
      LEFT JOIN user_pricing_factors upf ON u.id = upf.user_id
      LEFT JOIN pricing_factors pf ON upf.factor_id = pf.id
      LEFT JOIN users assigned_by_user ON upf.assigned_by = assigned_by_user.id
      WHERE u.is_active = true
      ORDER BY u.email
    `);
    return result.rows;
  }

  // Remove factor assignment from user
  static async removeFromUser(userId: number): Promise<void> {
    await db.query('DELETE FROM user_pricing_factors WHERE user_id = $1', [userId]);
  }
}