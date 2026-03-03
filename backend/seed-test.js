require('dotenv').config();
const mongoose = require('mongoose');

// Use the exact current schema shapes based on the app
const optionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    stock: { type: String, required: true },
    action: { type: String, enum: ['CALL', 'PUT'], required: true },
    confidence: { type: Number, required: true },
    risk: { type: String, required: true },
    support: { type: Number },
    resistance: { type: Number },
    pe: { type: Number },
    industryPe: { type: Number },
    averagePe5Yr: { type: Number },
    trend: { type: String },
    newsSummary: { text: { type: String }, color: { type: String } },
    analysis: { text: { type: String }, color: { type: String } },
    forecast1Year: { text: { type: String }, color: { type: String } },
    tomorrowRange: { type: String },
    emaAnalysis: { text: { type: String }, color: { type: String } },
    rsiAnalysis: { text: { type: String }, color: { type: String } },
    vixThetaAnalysis: { text: { type: String }, color: { type: String } },
    supportResistanceAnalysis: { type: String },
    verdict: { text: { type: String }, color: { type: String } },
}, { timestamps: { createdAt: true, updatedAt: false } });

const adviceSchema = new mongoose.Schema({
    stock: { type: String, required: true },
    advice: { type: String, required: true },
    dateKey: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

async function seedData() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stock-options';
        await mongoose.connect(uri);
        console.log('Connected to DB at', uri);

        const Option = mongoose.model('Option', optionSchema);
        const Advice = mongoose.model('Advice', adviceSchema);

        // Wipe old
        await Option.deleteMany({});
        await Advice.deleteMany({});

        // Today's exact date string used by backend
        const todayDateKey = new Date().toISOString().split('T')[0];

        console.log('Inserting dummy data for date:', todayDateKey);

        const dummyOption = new Option({
            userId: 'anonymous',
            stock: 'MOCK STOCK (TEST)',
            action: 'CALL',
            confidence: 95,
            risk: 'Low',
            support: 100, resistance: 150, pe: 10, industryPe: 15, averagePe5Yr: 12,
            trend: 'Bullish',
            newsSummary: { text: 'Great news today', color: 'green' },
            analysis: { text: 'Breaking out', color: 'green' },
            forecast1Year: { text: 'Bullish', color: 'green' },
            tomorrowRange: '$100-$110',
            emaAnalysis: { text: 'Golden cross', color: 'green' },
            rsiAnalysis: { text: 'Oversold', color: 'green' },
            vixThetaAnalysis: { text: 'Stable', color: 'green' },
            supportResistanceAnalysis: 'Testing support',
            verdict: { text: 'Buy now', color: 'green' },
        });

        const dummyAdvice = new Advice({
            stock: 'MOCK STOCK (TEST)',
            advice: '<h3>Mock Advice</h3><p>This is a test of the DB connection.</p>',
            dateKey: todayDateKey
        });

        await Promise.all([dummyOption.save(), dummyAdvice.save()]);

        console.log('Seeded successfully.');
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seedData();
