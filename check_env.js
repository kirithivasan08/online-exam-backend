require('dotenv').config();

console.log("\n--- CONFIG CHECK ---");
console.log("Looking for .env file...");

// Check EMAIL_USER
if (process.env.EMAIL_USER) {
    if (process.env.EMAIL_USER.includes("replace-this-part")) {
        console.warn("⚠️  EMAIL_USER is set, but it's still the default placeholder!");
    } else {
        console.log("✅ EMAIL_USER is loaded: " + process.env.EMAIL_USER);
    }
} else {
    console.error("❌ EMAIL_USER is MISSING completely.");
}

// Check EMAIL_PASS
if (process.env.EMAIL_PASS) {
    if (process.env.EMAIL_PASS.includes("replace-with-your")) {
        console.warn("⚠️  EMAIL_PASS is set, but it's still the default placeholder!");
    } else {
        console.log("✅ EMAIL_PASS is loaded (Length: " + process.env.EMAIL_PASS.length + " chars)");
    }
} else {
    console.error("❌ EMAIL_PASS is MISSING completely.");
}

console.log("--------------------\n");
