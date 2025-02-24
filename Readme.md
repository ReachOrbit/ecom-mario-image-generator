# Pixel Art Generator

## Description

The Pixel Art Generator is a Node.js application that processes CSV files containing LinkedIn profile URLs and generates pixel art images based on the profile pictures. The application uses various services to handle CSV parsing, image processing, and interaction with external APIs for image generation and storage.

## Features

- **CSV Processing**: Parses CSV files to extract LinkedIn URLs and other relevant data.
- **Image Processing**: Downloads and processes profile pictures, generating pixel art.
- **API Integration**: Interacts with Discord and Imagine API for image generation.
- **Slack Notifications**: Sends progress updates and completion notifications to a Slack channel.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ReachOrbit/ecom-mario-image-generator.git
   cd ecom-mario-image-generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**: Create a `.env` file in the root directory, or alternatively, clone `.env.example` and rename it to `.env`.

4. **Run the application**:
   ```bash
   npm run start
   ```

## Usage

1. **Health Check**: Verify the server is running by accessing the health endpoint:
   ```
   GET /health
   ```

2. **Process Profiles**: Upload a CSV file to process profiles and generate pixel art:
   ```
   POST /api/process
   ```

3. **Generate Placeholder Images**: Upload a CSV file with character images to generate placeholder art:
   ```
   POST /api/generate-placeholder-images
   ```

4. **Remove Background from Images**: Upload a CSV file to remove backgrounds from character images:
   ```
   POST /api/remove-background-from-character-images
   ```

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.

## Contact

For questions or support, please contact anique@reachorbit.email or sean@reachorbit.email
