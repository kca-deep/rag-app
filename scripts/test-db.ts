#!/usr/bin/env npx tsx

import { db } from '../lib/db'
import { collections, documents } from '../lib/schema'
import { v4 as uuidv4 } from 'uuid'

async function testDatabase() {
  try {
    console.log('Testing database connection and schema...')

    // Test 1: Insert a test collection
    const testCollection = {
      id: uuidv4(),
      name: 'Test Collection',
      description: 'A test collection for validation',
      metadata: { test: true },
      isActive: true,
    }

    const insertResult = await db.insert(collections).values(testCollection).returning()
    console.log('✓ Successfully inserted test collection:', insertResult[0]?.name)

    // Test 2: Query the collection
    const allCollections = await db.select().from(collections)
    console.log(`✓ Found ${allCollections.length} collection(s) in database`)

    // Test 3: Update the collection
    await db.update(collections)
      .set({ description: 'Updated test collection' })
      .where(eq(collections.id, testCollection.id))
    console.log('✓ Successfully updated collection')

    // Test 4: Delete the test collection
    await db.delete(collections).where(eq(collections.id, testCollection.id))
    console.log('✓ Successfully deleted test collection')

    // Test 5: Verify deletion
    const remainingCollections = await db.select().from(collections)
    console.log(`✓ Collections after cleanup: ${remainingCollections.length}`)

    console.log('\n🎉 All database tests passed successfully!')

  } catch (error) {
    console.error('❌ Database test failed:', error)
    throw error
  }
}

// Import eq function
import { eq } from 'drizzle-orm'

testDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))