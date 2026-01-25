
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function getDomainInfo() {
    const domainId = '91bd69de-1a14-48b4-8b4c-5313617d616d';
    console.log(`🔍 Fetching DNS records for Domain ID: ${domainId}...`);

    try {
        const { data, error } = await resend.domains.get(domainId);

        if (error) {
            console.error('❌ Resend Error:', error);
            return;
        }

        console.log(`\n✅ Domain found: ${data.name} [Status: ${data.status}]`);
        console.log('--------------------------------------------------');
        console.log('DNS RECORDS TO ADD:');
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

getDomainInfo();
