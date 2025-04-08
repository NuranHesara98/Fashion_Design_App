"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var dotenv = require("dotenv");
// Load environment variables
dotenv.config();
// Sketch data with S3 URIs from MongoDB database
var sketchData = [
    // {
    //     name: 'sketch_1.jpg',
    //     imageUrl: 'sketches/1742144175116-119e7a15-5c6e-4669-9e13-f7d8e6cd8f84.jpg',
    //     s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1742146235334-9b196198-0ca6-42d5-9b03-c29b77e4ed87.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2ZYPPBDBFP6M%2F20250316%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250316T173035Z&X-Amz-Expires=604800&X-Amz-Signature=5f6e9968c3fc7ef95e054e2be2baa58029209cc9e9ef804e1f09be1c79dc75a5&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject',
    //     category: 'Short frock'
    // },
    // {
    //     name: 'sketch_2.jpg',
    //     imageUrl: 'sketches/1742144180649-77def1ad-c3a2-4e80-9a78-d3b7287e6be.jpg',
    //     s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1742146239939-a1f3e39a-d138-4186-bda9-f3e22869afc7.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAU6GD2ZYPPBDBFP6M%2F20250316%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250316T173040Z&X-Amz-Expires=604800&X-Amz-Signature=55e47715e58d247f0107f1da40538e46f2b9a3e05de22a63d793979119bd8ff2&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject',
    //     category: 'Long frock'
    // },
    {
        name: 'sketch_3.jpg',
        imageUrl: 'sketches/1742144184326-41c8766-5f3c-4b84-a4f2-4c2dd1ad1d7.jpg',
        s3Uri: 'https://dressme-sketches.s3.eu-north-1.amazonaws.com/sketches/1741761221639-d0642bc0-9aed-41fb-840b-51921050c42f.jpg',
        category: 'Top'
    },
    {
        name: 'sketch_4.jpg',
        imageUrl: 'sketches/1742144187573-1f7c6c2a-a3c0-4b0a-9c5e-b9e3f3a0f9a8.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144187573-1f7c6c2a-a3c0-4b0a-9c5e-b9e3f3a0f9a8.jpg',
        category: 'Other'
    },
    {
        name: 'sketch_5.jpg',
        imageUrl: 'sketches/1742144191042-a8d8c9c8-c7e0-4f3a-b6a7-d2e9e4c5f3b2.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144191042-a8d8c9c8-c7e0-4f3a-b6a7-d2e9e4c5f3b2.jpg',
        category: 'Short frock'
    },
    {
        name: 'sketch_6.jpg',
        imageUrl: 'sketches/1742144194526-e3f7d8c6-b5a9-4c1d-8e2f-a1b9c8d7e6f5.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144194526-e3f7d8c6-b5a9-4c1d-8e2f-a1b9c8d7e6f5.jpg',
        category: 'Long frock'
    },
    {
        name: 'sketch_7.jpg',
        imageUrl: 'sketches/1742144198015-7b6a5c4d-3e2f-4a1b-9c8d-7e6f5a4b3c2d.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144198015-7b6a5c4d-3e2f-4a1b-9c8d-7e6f5a4b3c2d.jpg',
        category: 'Top'
    },
    {
        name: 'sketch_8.jpg',
        imageUrl: 'sketches/1742144201489-9d8e7f6a-5b4c-3d2e-1f0a-9b8c7d6e5f4a.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144201489-9d8e7f6a-5b4c-3d2e-1f0a-9b8c7d6e5f4a.jpg',
        category: 'Other'
    },
    {
        name: 'sketch_9.jpg',
        imageUrl: 'sketches/1742144204963-2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144204963-2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a.jpg',
        category: 'Short frock'
    },
    {
        name: 'sketch_10.jpg',
        imageUrl: 'sketches/1742144208437-8a7b6c5d-4e3f-2d1c-0b9a-8c7d6e5f4a3b.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144208437-8a7b6c5d-4e3f-2d1c-0b9a-8c7d6e5f4a3b.jpg',
        category: 'Long frock'
    },
    {
        name: 'sketch_11.jpg',
        imageUrl: 'sketches/1742144211911-4a3b2c1d-0e9f-8a7b-6c5d-4e3f2d1c0b9a.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144211911-4a3b2c1d-0e9f-8a7b-6c5d-4e3f2d1c0b9a.jpg',
        category: 'Top'
    },
    {
        name: 'sketch_12.jpg',
        imageUrl: 'sketches/1742144215385-0b9a8c7d-6e5f-4a3b-2c1d-0e9f8a7b6c5d.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144215385-0b9a8c7d-6e5f-4a3b-2c1d-0e9f8a7b6c5d.jpg',
        category: 'Other'
    },
    {
        name: 'sketch_13.jpg',
        imageUrl: 'sketches/1742144218859-6c5d4e3f-2d1c-0b9a-8c7d-6e5f4a3b2c1d.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144218859-6c5d4e3f-2d1c-0b9a-8c7d-6e5f4a3b2c1d.jpg',
        category: 'Short frock'
    },
    {
        name: 'sketch_14.jpg',
        imageUrl: 'sketches/1742144222333-2c1d0e9f-8a7b-6c5d-4e3f-2d1c0b9a8c7d.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144222333-2c1d0e9f-8a7b-6c5d-4e3f-2d1c0b9a8c7d.jpg',
        category: 'Long frock'
    },
    {
        name: 'sketch_15.jpg',
        imageUrl: 'sketches/1742144225807-8c7d6e5f-4a3b-2c1d-0e9f-8a7b6c5d4e3f.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144225807-8c7d6e5f-4a3b-2c1d-0e9f-8a7b6c5d4e3f.jpg',
        category: 'Top'
    },
    {
        name: 'sketch_16.jpg',
        imageUrl: 'sketches/1742144229281-4e3f2d1c-0b9a-8c7d-6e5f-4a3b2c1d0e9f.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144229281-4e3f2d1c-0b9a-8c7d-6e5f-4a3b2c1d0e9f.jpg',
        category: 'Other'
    },
    {
        name: 'sketch_17.jpg',
        imageUrl: 'sketches/1742144232755-0e9f8a7b-6c5d-4e3f-2d1c-0b9a8c7d6e5f.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144232755-0e9f8a7b-6c5d-4e3f-2d1c-0b9a8c7d6e5f.jpg',
        category: 'Short frock'
    },
    {
        name: 'sketch_18.jpg',
        imageUrl: 'sketches/1742144236229-6e5f4a3b-2c1d-0e9f-8a7b-6c5d4e3f2d1c.jpg',
        s3Uri: 'https://preview-sketches.s3.ap-south-1.amazonaws.com/sketches/1742144236229-6e5f4a3b-2c1d-0e9f-8a7b-6c5d4e3f2d1c.jpg',
        category: 'Long frock'
    }
];
// Connect to MongoDB
var MONGO_URI = process.env.MONGO_URI || '';
if (!MONGO_URI) {
    console.error('MongoDB URI not found in environment variables');
    process.exit(1);
}
// Create a connection to the Sketches database
var SKETCHES_URI = MONGO_URI.replace('User_information', 'Sketches');
console.log("Connecting to Sketches database: ".concat(SKETCHES_URI.replace(/\/\/.+?:.+?@/, '//<credentials hidden>@')));
var sketchesConnection = mongoose.createConnection(SKETCHES_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
// Define Sketch schema
var sketchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Sketch name is required']
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required']
    },
    s3Uri: {
        type: String,
        required: [true, 'S3 URI is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['All', 'Short frock', 'Long frock', 'Top', 'Other']
    }
}, {
    timestamps: true
});
// Create Sketch model
var Sketch = sketchesConnection.model('Sketch', sketchSchema);
// Seed function
var seedSketches = function () { return __awaiter(void 0, void 0, void 0, function () {
    var createdSketches, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                // Clear existing data
                return [4 /*yield*/, Sketch.deleteMany({})];
            case 1:
                // Clear existing data
                _a.sent();
                console.log('Deleted existing sketches');
                return [4 /*yield*/, Sketch.insertMany(sketchData)];
            case 2:
                createdSketches = _a.sent();
                console.log("Successfully seeded ".concat(createdSketches.length, " sketches"));
                // Close connection
                return [4 /*yield*/, sketchesConnection.close()];
            case 3:
                // Close connection
                _a.sent();
                console.log('Database connection closed');
                process.exit(0);
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error('Error seeding sketches:', error_1);
                process.exit(1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
// Run the seed function
sketchesConnection.on('connected', function () {
    console.log('Connected to Sketches database. Starting seed process...');
    seedSketches();
});
sketchesConnection.on('error', function (err) {
    console.error('Error connecting to Sketches database:', err);
    process.exit(1);
});
