
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function setup() {
    const domainName = 'passionacademia.ac.pk';
    console.log(`🚀 Registering domain: ${domainName}...`);

    try {
        const { data, error } = await resend.domains.create({ name: domainName });

        if (error) {
            console.error('❌ Resend Error:', error);
            return;
        }

        console.log('\n✅ Domain Registered Successfully!');
        console.log('--------------------------------------------------');
        console.log('NEXT STEP: Add these DNS records to your domain provider:');
        console.log('--------------------------------------------------\n');

        data.records.forEach(record => {
            console.log(`Type:  ${record.type}`);
            console.log(`Name:  ${record.name}`);
            console.log(`Value: ${record.value}`);
            console.log('--------------------------------------------------');
        });

        console.log('\nAfter adding these, visit https://resend.com/domains to verify.');
    } catch (err) {
        console.error('❌ Critical Error:', err.message);
    }
}

setup();
