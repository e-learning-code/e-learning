// Quick script to run the DELETE policy migration
// Run with: npx tsx scripts/add-delete-policy.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://omihrguxqjkiulnmpgsu.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9taWhyZ3V4cWpraXVsbm1wZ3N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ5MjY2MSwiZXhwIjoyMDg1MDY4NjYxfQ.etfSMqWQG0TsAf9UHK3b4TfuVfYaahAN2H7qJmaUGm4'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function addDeletePolicy() {
    console.log('Adding DELETE policy for messages table...')

    try {
        // First policy: users can delete their own messages
        const { error: error1 } = await supabase.rpc('exec', {
            sql: `
-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;

-- Users can delete messages they sent or received
CREATE POLICY "messages_delete_own" ON public.messages 
  FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
`
        })

        if (error1) {
            console.log('Note: exec RPC not available, using direct SQL execution')
        }

        // Second policy: admin can delete any messages
        const { error: error2 } = await supabase.rpc('exec', {
            sql: `
DROP POLICY IF EXISTS "messages_delete_admin" ON public.messages;

CREATE POLICY "messages_delete_admin" ON public.messages 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
`
        })

        if (error2) {
            console.log('Note: Use Supabase Dashboard SQL Editor to run 005_add_messages_delete_policy.sql')
        }

        console.log('✅ Migration script ready!')
        console.log('📋 If RPC failed, please run scripts/005_add_messages_delete_policy.sql in Supabase Dashboard')
    } catch (error) {
        console.error('Error:', error)
    }
}

addDeletePolicy()
