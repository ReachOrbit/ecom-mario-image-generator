const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Define input and output directories
const inputDir = path.join(process.cwd(), 'downloaded_files'); // Replace with your input directory
const outputDir = path.join(process.cwd(), 'converted_files');

// Ensure the output directory exists
fs.mkdirSync(outputDir, { recursive: true });

// Function to process all files in a directory recursively
async function processDirectory(inputDir, outputDir) {
    const files = fs.readdirSync(inputDir);

    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const stat = fs.statSync(inputPath);

        if (stat.isDirectory()) {
            // Recursively process subdirectories
            const subOutputDir = path.join(outputDir, file);
            fs.mkdirSync(subOutputDir, { recursive: true });
            await processDirectory(inputPath, subOutputDir);
        } else {
            // Process the file
            try {
                console.log(`Processing file: ${inputPath}`);
                
                const outputFileName = path.basename(file, path.extname(file)) + '.png';
                const outputFilePath = path.join(outputDir, outputFileName);

                // If the file already exists, append a unique suffix
                let finalFilePath = outputFilePath;
                let counter = 1;
                while (fs.existsSync(finalFilePath)) {
                    const uniqueSuffix = `_${counter}`;
                    finalFilePath = path.join(
                        outputDir,
                        path.basename(file, path.extname(file)) + uniqueSuffix + '.png'
                    );
                    counter++;
                }

                await sharp(inputPath).toFormat('png').toFile(finalFilePath);
                console.log(`Converted to: ${finalFilePath}`);
            } catch (error) {
                console.error(`Failed to process file: ${inputPath}`, error);
            }
        }
    }
}

// Start processing
(async () => {
    try {
        console.log('Starting file conversion...');
        await processDirectory(inputDir, outputDir);
        console.log('File conversion completed.');
    } catch (error) {
        console.error('Error during file conversion:', error);
    }
})();
