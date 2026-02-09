import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src');
const OUT_DIR = path.join(__dirname, '../filters');

// Ensure output directory exists
if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Helper to get current UTC timestamp
function getTimestamp() {
    return new Date().toISOString();
}

// Helper to parse content into headers and rules
// Stops parsing headers at the first empty comment (!) or first non-comment line
function parseContent(content) {
    const lines = content.split('\n');
    let rulesStartIndex = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '!') {
            rulesStartIndex = i + 1;
            break;
        }
        if (!line.startsWith('!')) {
            rulesStartIndex = i;
            break;
        }
    }

    return {
        headers: lines.slice(0, rulesStartIndex).join('\n'),
        rules: lines.slice(rulesStartIndex).join('\n').trim()
    };
}

// Helper to parse version from file content (only searches headers)
function getVersion(content) {
    const { headers } = parseContent(content);
    const match = headers.match(/! Version: (\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

// Helper to increment version
function incrementVersion(version) {
    return (version || 0) + 1;
}

// Helper to normalize content for checksum
// Removes \r and replaces multiple \n with single \n
function normalizeContent(content) {
    return content.replace(/\r/g, '').replace(/\n+/g, '\n');
}

// Helper to calculate MD5 checksum
function calculateChecksum(content) {
    const normalized = normalizeContent(content);
    const checksum = crypto.createHash('md5').update(normalized).digest('base64');
    return checksum.replace(/=+$/, '');
}

// Helper to extract just the rules
function extractRules(content) {
    return parseContent(content).rules;
}

async function build() {
    const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.txt'));

    for (const file of files) {
        const srcPath = path.join(SRC_DIR, file);
        const outPath = path.join(OUT_DIR, file);
        const name = path.basename(file, '.txt');
        const title = 'SpicySpaceman - ' + name.charAt(0).toUpperCase() + name.slice(1) + ' Filter';

        // Read Source
        const srcRules = fs.readFileSync(srcPath, 'utf8').trim();

        // Check Existing
        let version = 1;
        let shouldBuild = true;

        if (fs.existsSync(outPath)) {
            const outContent = fs.readFileSync(outPath, 'utf8');
            const outRules = extractRules(outContent);
            const currentVersion = getVersion(outContent);
            const hasChecksum = outContent.includes('! Checksum:');

            if (outRules === srcRules) {
                if (hasChecksum) {
                    console.log(`Skipping ${file} (No changes detected)`);
                    shouldBuild = false;
                } else {
                    console.log(`Updating ${file} (Missing checksum)`);
                    version = incrementVersion(currentVersion);
                    shouldBuild = true;
                }
            } else {
                console.log(`Building ${file} (Changes detected)`);
                version = incrementVersion(currentVersion);
                shouldBuild = true;
            }
        } else {
            console.log(`Building ${file} (New filter)`);
        }

        if (shouldBuild) {
            // Generate Body (Headers + Rules) WITHOUT Checksum first

            const headerInfo = [
                `! Title: ${title}`,
                `! Version: ${version}`,
                `! Last modified: ${getTimestamp()}`,
                `! Expires: 4 hours (update frequency)`,
                `! Homepage: https://github.com/SpicySpaceman/FilterList`,
                `! License: https://github.com/SpicySpaceman/FilterList/blob/main/LICENSE`,
                `!`
            ];

            const body = headerInfo.join('\n') + '\n' + srcRules;

            // Calculate Checksum of the body
            const checksum = calculateChecksum(body);
            const finalContent = `! Checksum: ${checksum}\n` + body;

            fs.writeFileSync(outPath, finalContent);
            console.log(`-> Built ${file} (v${version})`);
        }
    }
}

build().catch(err => {
    console.error(err);
    process.exit(1);
});
