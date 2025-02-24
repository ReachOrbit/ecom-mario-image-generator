// Add this line at the beginning of your script
console.log('Current working directory:', process.cwd());

const fs = require('fs');
const csvParser = require('csv-parser');
const { writeToPath } = require('fast-csv');

function updateCSV(originalCsvPath, results, outputCsvPath) {
    const resultsMap = new Map(results.map(result => [result.url, result]));

    const updatedRows = [];

    fs.createReadStream(originalCsvPath)
        .pipe(csvParser())
        .on('data', (row) => {
            const linkedinUrl = row.linkedinUrl;
            const result = resultsMap.get(linkedinUrl);

            if (result) {
                row['Profile Picture URL'] = result.status === 'success' ? result.profilePicture : '';
                row['Status'] = result.status;
                row['Generated Image 1'] = result.pixelArtUrls && result.pixelArtUrls[0].replace(/^https:\/\/https:\/\//, 'https://') || '';
                row['Generated Image 2'] = result.pixelArtUrls && result.pixelArtUrls[1].replace(/^https:\/\/https:\/\//, 'https://') || '';
                row['Generated Image 3'] = result.pixelArtUrls && result.pixelArtUrls[2].replace(/^https:\/\/https:\/\//, 'https://') || '';
                row['Generated Image 4'] = result.pixelArtUrls && result.pixelArtUrls[3].replace(/^https:\/\/https:\/\//, 'https://') || '';
                row['error'] = result?.error?.startsWith("Failed to process profile picture") ? "Failed to process profile picture" : result.error;
            }

            updatedRows.push(row);
        })
        .on('end', () => {
            writeToPath(outputCsvPath, updatedRows, { headers: true })
                .on('finish', () => {
                    console.log(`Updated CSV written to ${outputCsvPath}`);
                });
        });
}

// Example usage:
const originalCsvPath = '1_to_500_Ecom.csv';
const outputCsvPath = 'updated_1_500_Ecom.csv';
const results = [
    {
      "url": "https://linkedin.com/in/brianstraylor",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/sarah-peterson-b1224930",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/kevindestatte",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/michelle-munoz-b0aa297b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/dana-cohen-a78a153",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/paul-blakey-254515105",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/sal-aziz-7560b75",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/kelly-watson-190406190",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/allisonatwill",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/kelli-marie-740548140",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/corysmith22",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/tom-klemz-b75ab673",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/john-mcmahon-9850537",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/emma-mcilroy-she-her-97811422",
      "status": "failed",
      "error": "Failed to process profile picture: /Users/syedanique/Desktop/reach-orbit/OrbitInternalTools/processed_images/Emma_Mcilroy_(she/her).png: unable to open for write\nunix error: No such file or directory"
    },
    {
      "url": "https://linkedin.com/in/marnieconsky",
      "status": "failed",
      "error": "Failed to process profile picture: /Users/syedanique/Desktop/reach-orbit/OrbitInternalTools/processed_images/Marnie_Rabinovitch_Consky_(she/her).png: unable to open for write\nunix error: No such file or directory"
    },
    {
      "url": "http://www.linkedin.com/in/petermeddick",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/ryanbowser",
      "status": "failed",
      "error": "Failed to process profile picture: /Users/syedanique/Desktop/reach-orbit/OrbitInternalTools/processed_images/RYAN_DIMITRI_BOWSER_P/K/A_GHOST.png: unable to open for write\nunix error: No such file or directory"
    },
    {
      "url": "https://linkedin.com/in/kelly-mccullough-35113014a",
      "status": "success",
      "originalImagePath": "/Users/syedanique/Desktop/reach-orbit/OrbitInternalTools/processed_images/Kelly_McCullough.png",
      "pixelArtUrls": [
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/608510/608510_1",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/608510/608510_2",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/608510/608510_3",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/608510/608510_4"
      ],
      "profilePicture": "https://media.licdn.com/dms/image/v2/D4E03AQHn5nrmfip0YQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1721784222733?e=1739404800&v=beta&t=NNwSyDEIpRquIRfTh3vCY2LobuUn_LbPM9riihzG3LU"
    },
    {
      "url": "https://linkedin.com/in/niki-sawyer-27364055",
      "status": "success",
      "originalImagePath": "/Users/syedanique/Desktop/reach-orbit/OrbitInternalTools/processed_images/Niki_Sawyer.png",
      "pixelArtUrls": [
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/256770/256770_1",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/256770/256770_2",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/256770/256770_3",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/256770/256770_4"
      ],
      "profilePicture": "https://media.licdn.com/dms/image/v2/D5603AQHmM1ZcDKyMqQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1713935840715?e=1739404800&v=beta&t=Twr9Q7MuPVua6keGSoE_asIpDDN1UAM0pkr0G5w1GT4"
    },
    {
      "url": "http://www.linkedin.com/in/rachelmdavidson",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/kelly-walter-7979931",
      "status": "success",
      "originalImagePath": "/Users/syedanique/Desktop/reach-orbit/OrbitInternalTools/processed_images/Kelly_Walter.png",
      "pixelArtUrls": [
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/264973/264973_1",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/264973/264973_2",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/264973/264973_3",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/264973/264973_4"
      ],
      "profilePicture": "https://media.licdn.com/dms/image/v2/C5103AQHqi6pY6V5jWw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1516347478827?e=1739404800&v=beta&t=x7CVlNVoSmDsIn5mJUysAJWeeBUHBd9eoKOHA46H33g"
    },
    {
      "url": "https://linkedin.com/in/gregory-reeder/es",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/amsmith818/fr",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/william-lasserre/en",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/mark-galvez-56a909230/ar",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://www.linkedin.com/in/amy-mahon-131133137/?originalSubdomain=uk",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://www.linkedin.com/in/ruby-brown-674035189/?originalSubdomain=uk",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/rebeccalwebb1/en",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/nicolas-beetz-b98a3450/en",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/danitiemi/en",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/nicogloazzo/en",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/adam-zhang-852075109/en",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/takayuki-date-778240147/en",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://www.linkedin.com/in/faithdj/?locale=en_US",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/andres-gonzalez-mendoza-57261919a/en-us",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/miadragasoien/en",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/weilinghung/en",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/marlyn-henao-rend%C3%B3n/en",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/michelle-saltzman-456039152",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/stan-cook-8a351179",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/gary-lu-10853328",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/zach-bowling-17907629",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/abril-estrada",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/rebecca-monarch-3566656",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/jon-nordhem-a627689",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/ted-livingston-41611a261",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/emily-flowers-77a946a",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/greg-wittreich-cpa-ba48a920",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/campbell-frame",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/yinka-davies-394b902b8",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/lisa-barbaccia-43a88292",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/mary-hw-b5596270",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/jeff-aronson-45516ab2",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/rita-woodrum-b685ba10",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/kristine-snow-64751798",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/kendra-rothstein-105620119",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/sean-warner-5896766b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/fred-schwartz-3026b3a",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/branch-douglas-958a5310",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/annabel-love-011550122",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/crabtree-marina",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/debi-smith-206a12a",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/julie-brown-5b52862a",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/janet-ketron-46787677",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/harrymcgee",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/hannah-ellett-a9a156116",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/sahae-tickets-728997216",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/lynn-thorneburg-2452a323",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/kylegbradley",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/mikael-gronlund",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/kelly-harrelson-635ba16",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/esber-hajli-a4498015",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/andrew-bawden-7324151b2",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/elizabeth-fedewa",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/anne-chen-a43328247",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/tracy-brubaker-08b7b011b",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/gary-eustache-8b92565",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/charlesjohntursi",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/bradlunt",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/jot-c-953b5719",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/amir-hakak-0666a496",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/william-taylor-03a984140",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/sukhmeet-dillon-a931bb137",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/laurie-erickson-3478956",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/heidi-reynolds-98515a245",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/vanessa-boiardi-72a689188",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/andy-logan-a8ba498",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/iamjoshclarke",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/jordangoldstein",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/coco-inamori-b584a6101",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/tom-b-7533852",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/mackenzie-lamberton-b2717b53",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/samborri",
      "status": "success",
      "originalImagePath": "/Users/syedanique/Desktop/reach-orbit/OrbitInternalTools/processed_images/Sam_Borri.png",
      "pixelArtUrls": [
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/606551/606551_1",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/606551/606551_2",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/606551/606551_3",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/606551/606551_4"
      ],
      "profilePicture": "https://media.licdn.com/dms/image/v2/C5603AQHRAgFY2R29Ng/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1652656634705?e=1739404800&v=beta&t=c-o4NilId4gRd1dCxmWilw8NNu7WMU3eXzKutfr9VRs"
    },
    {
      "url": "https://linkedin.com/in/philippe-chantecaille-38471715",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/kimberly-webb-ba0babab",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/hamed-ebrahimi-8b1335aa",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/elmer-cayetano-010a08a4",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/charlotte-cabot-880652a0",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/elise-nardi-634454202",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/wilson-nai-546a9b117",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/janie-hall-325a2698",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/jeffcpratt",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/gayle-crystal-0b2684276",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/kate-haws-a9916922",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/brian-hack-6a0831",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/amandaklee1",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/smagbee",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/john-odonnell-853223139",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/rebeccavega",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/ryanmcmanimie",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/david-edwards-449516181",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/blake-reid-64883068",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/itzel-redondo-431739112",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/heidi-hicks-80581090",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/sean-warner-5896766b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/ahnatillmanns",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/tyallison",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/krista-roque-700517126",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/gabrielle-reynolds-6177bb9b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/jordan-dennett",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/jennifer-marlowe-067914",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/daniela-torre-a4930b114",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/justin-buck-b549602",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/aubree-gardiner-91939a192",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/lauren-artiglia-12503397",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/sherman-lin-14921629",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/juliepark454",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/lindsey-kaiser-9664b211a",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/maran-taryn-01a37b91",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/alyssa-vitali-796b7772",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/diego-salazar-37b4a8225",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/andrealisbona",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/kelly-b-santos-5b5a1212",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/gary-morton-6b7380134",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/angus-harper-b7806842",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/nick-guillen-a5a17644",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/julianne-willey",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/taylor-collins-81b938aa",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/dan-tsai-b0795458",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/michaelbranney",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/garrick-mitchell-928a42a3",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/trey-carlstrom-ba418012",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/myra-ryder-2939726",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/ignacio0001",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/lindsey-roy-400701214",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/kaitlinnkluzak",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/travis-hughes-9653aa33",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/pamela-yueh-3a53b413",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/simonmalone1",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/aaronargueta",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/lauren-berlingeri-1b6ab6a0",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/julia-franklin-4801a222",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/elizabeth-earley-75a72613",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/t-j-mcmeniman-6b83187",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/kevin-halonen-732a8459",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/jesse-khat-24348bb2",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/heidi-calloway-635a365",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/shawna-zook-29472039",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/debradresser",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/meghana-laddha-0915945",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/johjetta-coetzee-41873331",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/erica-cavanaugh-b98425b4",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/michael-lien-845b21166",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/nathan-roberts-696142106",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/tiffany-jenkins-7b402292",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/martin-j-bartmann-23195114",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/tomei-thomas-1802",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/gerri-rusch-1573824b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/angeliki-gerardou-meng1234",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/morgan-decker-b812b163",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://www.linkedin.com/in/patricklsanchez/",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/charlotte-katona-23700695",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/jake-verfuerth-745061107",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/kc-nelson-382a18114",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/oliviagabrielle",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/paolopirjanian",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/mariana-r-58b1b2120",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/tyler-prow-2380a17b",
      "status": "success",
      "originalImagePath": "/Users/syedanique/Desktop/reach-orbit/OrbitInternalTools/processed_images/Tyler_Prow.png",
      "pixelArtUrls": [
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/607107/607107_1",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/607107/607107_2",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/607107/607107_3",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/607107/607107_4"
      ],
      "profilePicture": "https://media.licdn.com/dms/image/v2/D4E03AQE_aWQYft4ubA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1686852753572?e=1739404800&v=beta&t=DKufIzReN7PNhoWfOnUTPAOHK7u0fEFS2b3OHqC5_IE"
    },
    {
      "url": "http://www.linkedin.com/in/chadshafer",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/rich-hager-928046a",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/fredcronin",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/melvinlian",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/jason-jim%C3%A9nez-pisani-p-e-541b69112",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/pat-barry-38a5bb8",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/ronnie-meistrell-189792a0",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/itamar-rubin-965967215",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/edward-chapman-a8515215",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/matt-lombardi-1595494b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/samantha-wuest-23940134",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/claraniniewski",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/alvaradoleslie",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/claire-dick-6380a4b5",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/johanrust",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/jonathan-gonzalez-5574a4132",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/britni-strates-a065bbba",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/rick-robertson-15186b6",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/woodie-lothrop-706641169",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/rhondasparks",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/courtney-toll-442602116",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/lydia-henderson-01993656",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/katherine-receveurwatercutter",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/danielleleslielewis",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/meghanjmaloney",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/jordanpallen",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/greg-raco-a78620a",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/lauren-brewer-540b2856",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/michael-saiger-miansai-34224bb2",
      "status": "success",
      "originalImagePath": "/Users/syedanique/Desktop/reach-orbit/OrbitInternalTools/processed_images/Michael_Saiger_-_Miansai.png",
      "pixelArtUrls": [
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/197602/197602_1",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/197602/197602_2",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/197602/197602_3",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/197602/197602_4"
      ],
      "profilePicture": "https://media.licdn.com/dms/image/v2/C5603AQEXAd0JjnoL_g/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1657120357394?e=1739404800&v=beta&t=hjYjS14I5KlVExUH8mx8yOsLls9b5nZLiHOiyRxiji4"
    },
    {
      "url": "http://www.linkedin.com/in/santon-de-la-vie-52269230",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/bill-robinson-b4176b103",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/joanne-lo-aa219690",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/sivanab",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/felix-javier-hernandez-mayoral-5a664a4",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/johngalloway24",
      "status": "success",
      "originalImagePath": "/Users/syedanique/Desktop/reach-orbit/OrbitInternalTools/processed_images/John_Galloway.png",
      "pixelArtUrls": [
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/607341/607341_1",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/607341/607341_2",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/607341/607341_3",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/607341/607341_4"
      ],
      "profilePicture": "https://media.licdn.com/dms/image/v2/C5603AQG5Bnx_1Azadw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1619887802560?e=1739404800&v=beta&t=gkA2X2WmOEZZQLBCreLheSLi_W_o1GLkbPhEZG_Emeg"
    },
    {
      "url": "http://www.linkedin.com/in/santoscriselle",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/mehdi-farsi-7bb0a474",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/rod-beattie-53551a15",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/jimmy-yao-18854916",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/steven-mann-39a33144",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/subramaniamvenkatraman",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/kristy-martinez-1b3b81a",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/mike-binch-b629b441",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/garykato",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/joseph-leifer-522b999",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/ben-day-a81a0b230",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/kelley-taylor-89728391",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/maria-victoria-leon-7001595",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/michael-saiger-miansai-34224bb2",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/chrislander1",
      "status": "success",
      "originalImagePath": "/Users/syedanique/Desktop/reach-orbit/OrbitInternalTools/processed_images/Chris_Lander.png",
      "pixelArtUrls": [
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/1254/1254_1",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/1254/1254_2",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/1254/1254_3",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/1254/1254_4"
      ],
      "profilePicture": "https://media.licdn.com/dms/image/v2/D5603AQGKsBdbcgOwuA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1715120169079?e=1739404800&v=beta&t=eNueYLg8SAJsCYQIBbQdthm0CgqGTi3A2WpFXkgwirs"
    },
    {
      "url": "http://www.linkedin.com/in/victor-donato-337ab45",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/muhga",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/jeri-neden-69ba7b4a",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/katharina-messer-4a7071174",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/moey-levy-3a34418",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/mike-wallace-474b9558",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/david-kim-11831928",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/kristen-rhodes-7374239",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/michelle-buck-b292249",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://www.linkedin.com/in/john-baker-a25463a4/",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/michael-pierce-522a468",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/stephanie-carter-73ab8212",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/gavin-vandeligt-3119b513",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/kevinhfan",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/harrisonluke",
      "status": "failed",
      "error": "Failed to process profile picture: Failed to generate image: Unexpected end of JSON input"
    },
    {
      "url": "http://www.linkedin.com/in/zach-cortinas-06943728",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/david-vanhimbergen-9680087",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/jess-brown-5052198",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/anne-snow-7238571b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/ken-patel-6b340b288",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/bill-martin-14a13ab6",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/michmcw",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/jessica-williamson-226258197",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/celine-urvoas-798681a",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/wesley-whistle-54283846",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/victoria-carruthers-6243a9110",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/makayla-reyes-2b42381aa",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/megan-leinonen-9587568a",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/don-payton-0a989037",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/devin-graciano-47303a313",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/annie-eldredge-bb75071b6",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/zainab-moosavi-7503aa22b",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/mary-skinner-bb638219a",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/megan-meneely-b45b44a4",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/maria-galati-ba4709bb",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/maria-uspenski-5a323311",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/natalie-quinn-2158b383",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/jared-rapoport-902a0264",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/dorielle-hadar-87865348",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/larry-fisher-74291b39",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/matt-kowalec",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/kent-barwind-25a88210",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/dylan-reese-512033220",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/karen-brooks-preble-737b3415",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/barbara-cameron-96237017",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/mehdi-farsi-7bb0a474",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/sarah-wells-30206340",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/arian-dheri-65b47850",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/amanda-canaday-a08713136",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/carolinaplexidas",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/janefisher14",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/pamela-anderson-0b51852",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/heatherscott11",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/shawn-bryant-with-smart-032b449b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/charliemossofk2awards",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/bob-davenport-0244a916",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/michael-saiger-miansai-34224bb2",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/maud-rey-28b90716",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/caroline-cory-41821716",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/cecille-atienza-25592028",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/hardeep-dhillon-911000305",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/charlotte-walters-31880a69",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/lisa-chen-8b34b233",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/mike-taylor-b24650a4",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/shannon-mahon",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/craig-zucker-93b16a206",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/ben-stafford-776b39109",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://www.linkedin.com/in/ryan-sieverson-4a45402/",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://www.linkedin.com/in/linda-tran33/",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/mike-dean-303a639",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/christopher-gyuricsek-0464b46b",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/michael-malinsky-69079356",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://www.linkedin.com/in/pamela-lewy-a534b412/",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/malcolm-robinson-b49276127",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/noranit-tungtragul-6772b940",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/sheila-cleary-baa38415",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/eric-smith-3b790094",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/bill-king-7147b446",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/amy-chen-b175708b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/carlo-taddei-11204220",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/julia-craven-1bab4b70",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/noah-simon-waddell-a05122133",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/maria-luisa-raya-b5952615",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/scott-giovanini-7354a211",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/howard-friend-bb71a369",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/joe-vella-bb02a31a",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/dave-barnes-8313823",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/lucinda-collins-82b09016",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/laura-nguyen-76729637",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/daniel-tussy-92038016",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/gabriela-c-a0030272",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/coby-coby-b64995a",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/viviannarodriguez",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/barratot",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/jared-farver-700240a8",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/donnyturingan",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/philip-de-leon-2ab6b921",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/dorishtay",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/jonathan-nguyen-5b090815",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/joel-love-17204a2b",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/david-ginther-69a2b778",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/suebreslindavidson",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/morgan-baker-04060238",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/megan-simon-266207185",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/tina-prendi-20409642",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/karenleslieyoung",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/mark-neumiller",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/heather-blish-strasser-778b794b",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/joe-vella-bb02a31a",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/mauro-rojas-b3303b4",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/joebentivegna",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/greg-monroe-8679916b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/lime-lush-boutique-0a0612105",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/nick-tershay-9830576",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/ramy-badie-4191a569",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/veronika-libao",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/micah-orvis-a93b5b132",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/sergiosartandmusic",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/tommy-zeledon-3bbbb7118",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/terrencesweeney",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/marv-leeck-066a3371",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/michelle-binder-72387716",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/lauren-kuzak-4883aaaa",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/west-cerrudo-612a922",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/michael-saiger-miansai-34224bb2",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/jon-doe-ab4971148",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/heatherlbowers",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/nihad-aytaman-87ab17a7",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/tylerkarow",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/mitch-ebrahimi-a2b4779a",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/mark-gabriel-0a75ab30",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/christinamosca",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/rebecca-puig-19107712",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/julia-friesen-a366bb62",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/anne-garcia-508722186",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/lydia-h-01993656",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/ronna-wolf-1296039",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/matthew-bolduc-4b570567",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/nicole-cherry-807a2b51",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/drew-miller-3a493458",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/ylldes-mustafa-78605110a",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/tanveer-chinoy-cpa-cfe-72a988b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/elsa-lu-5701091a3",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/nicolekramer0",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/tyler-bray",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/steven-sutton-73505b3a",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/jennplotkin",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/cedar-seeger-0b7a599",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/maria-uspenski-5a323311",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/gordie-spater",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/juergen-eckmann-2b85306",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/morganaminck",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/lynn-tran",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/alan-romero-87427678",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/robert-sutherland-217a89a4",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/shannon-rose-cpa-ba12a26a",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/brian-woods-a774081",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/linda-mcewan-592b1032",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/angelajekal",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/katie-daly-benjamin-9539791",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/sarah-nicholson-62025389",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/jon-gilmartin-84752396",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/lovro-slunjski-9128b9189",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/ephraim-sng",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/abbey-turner-401743162",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/whitneybiaggi",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/aminu-halilu-2486211",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/yousof-nathie-19430128",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/courtney-jacobs-holliday-193a71110",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/jonathan-gajito-9400a816b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/agathe-daloz-a311b359",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/clayphillips2",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/eric-k-olson-4b253395",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/eric-swanson-27515215",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/lucinda-collins-82b09016",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/sasha-vellor-0bb5b2286",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/renie-gorsuch-87603a14b",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/chris-taylor-34a217113",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/revachoi",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/christin-philipsen-082097181",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/gabriellehennen",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/lisa-vo-nagamoto-02625759",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/patrick-cho-36470ab3",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/bill-bradley-wjb",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/bryce-fisher-881aa5117",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/david-daily-167a906b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/gabriela-pizano-21364a224",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/courtneyaratcliffe",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/byron-young-7417397",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/premier-yarns-581629276",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/kevin-pankanin-523a4743",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/michelle-baldwin-kenyon-1809503",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/rati-bhandari-3a395a31",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/connor-siler-20b55aa5",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/marinachatzimichali",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/michael-hughes-plushbeds",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/diana-resiga-4217b13",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/james-eberlein-9b412b5b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/misterbenonline",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/roka-roka-213900206",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/cathy-mawae-01760b15",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/byron-young-7417397",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://www.linkedin.com/in/william-ju-4828a5b/",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/patricia-santos-1b3427191",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/knockablock",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/samuel-sabori-66454373",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/brooke-gibson-08047b240",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/ashleypaguyo",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/mena-ibrahim",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/courtney-tarleton-86116965",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/alecrrivers",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/elaina-vega-44b40b8a",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/jordanpmeyer",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/leslie-mccoy-7848247",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/kbriannacollins",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/jenny-lupoff-38a28511b",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/douglas-forinash-24633664",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/jason-hunt-b2539427",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/alen-hamzic-bbb96a251",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/nancy-marcotte-3465b05b",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/greg-beebe-b87b6315",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/teresa-smith-89239644",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/jessica-slabaugh-cpa",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://www.linkedin.com/in/carinna-arvizo-511b5b28/",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/brandon-blackwood-516047a1",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/ignacio-valdivia-9152b3127",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/ramy-sharp-1a207ba9",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/andrea-harden-90874577",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/julessrich",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/isaac-morton-41a89613b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/amber-goodlander-a2638a4b",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/patrishayabes",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/billy-shehadeh-8a886072",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/thomas-maloney-1b9598235",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/john-gagliardi-5628767",
      "status": "success",
      "originalImagePath": "/Users/syedanique/Desktop/reach-orbit/OrbitInternalTools/processed_images/John_Gagliardi.png",
      "pixelArtUrls": [
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/265021/265021_1",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/265021/265021_2",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/265021/265021_3",
        "https://https://orbit-bucket.sfo3.digitaloceanspaces.com/ecom-generated-images/265021/265021_4"
      ],
      "profilePicture": "https://media.licdn.com/dms/image/v2/D4E03AQEkhm76yfGPcg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1671232850235?e=1739404800&v=beta&t=D8pS_gddl8lu8F5LF7RtPg6NFM_G8nu9pRIDs61LloE"
    },
    {
      "url": "https://linkedin.com/in/maya-may-bb7399a",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/tara-wrenn-89295613",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/brittany-richter-526338193",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/lacey-steen-205a4a126",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/george-youmans-43428052",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/steve-gniadecki-b9583236",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/mira-mira-18820037",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/lynn-olson-825b0a17",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/collin-duff-1bba92144",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/thorenp",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/colin-cutler-56878080",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/etreber",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/avi-tahari-7bbba17b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/beau-nickol-71502514",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/adrian-perez-5b98b917a",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/stephanie-steacker-7b6a5315a",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/lee-rhodes-4a80a910",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/adamdogrady",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/galya-gundelova-0761103",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/ramy-sharp-1a207ba9",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/dave-rouleau-8b246011b",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/jill-connor-kalata",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/jessica-batiste-234b87130",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/michaelpeduto",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/rms324",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/gina-romanello-a350804",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/ayami-botkin-08907117",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/aiden-urbine-62a7941bb",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/priyanka-l-jain",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/mary-shiratori-729b1b10",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/hannah-watrous",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/kristen-logan",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "http://www.linkedin.com/in/elio-freitas-182b2741",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "http://www.linkedin.com/in/michael-anthony-digregorio-dimaggio-414381",
      "status": "failed",
      "error": "Invalid LinkedIn URL format"
    },
    {
      "url": "https://linkedin.com/in/jazmynsingleton",
      "status": "failed",
      "error": "No profile picture URL available"
    },
    {
      "url": "https://linkedin.com/in/jordan-mack-808491122",
      "status": "failed",
      "error": "No profile picture URL available"
    }
  ]

updateCSV(originalCsvPath, results, outputCsvPath);