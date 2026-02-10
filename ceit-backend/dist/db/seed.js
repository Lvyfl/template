"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const schema_1 = require("./schema");
const departmentsList = [
    { name: 'DIT' },
    { name: 'DIET' },
    { name: 'DAFE' },
    { name: 'DCEE' },
    { name: 'DCEA' },
];
async function seed() {
    console.log('Seeding departments...');
    for (const dept of departmentsList) {
        await index_1.db.insert(schema_1.departments).values(dept).onConflictDoNothing();
    }
    console.log('Seeding completed.');
    process.exit(0);
}
seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
