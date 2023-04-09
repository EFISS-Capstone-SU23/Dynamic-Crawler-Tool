import driver from '../../utils/chromeDriver.js';
import fs from 'fs';

// Read the JSON file and parse it into a JavaScript object
const jsonData = JSON.parse(fs.readFileSync('pagination.json'));

export default async function handleNumberDashboard(url) {
  const allLinks = new Set(); // Use a Set to store unique links
  try {
    await driver.get(url);

    while (true) {
      // Find all anchor elements on the page
      const anchorElements = await driver.findElements({ tagName: 'a' });

      // Extract the href attribute of each anchor element
      const links = await Promise.all(anchorElements.map(async (anchor) => {
        const href = await anchor.getAttribute('href');
        return href;
      }));

      // Add unique links to the Set
      links.forEach(link => allLinks.add(link));

      try {
        // Define the URL you're looking for
        const urlToFind = url;
        
        // Find the object with the matching URL and retrieve its paginationButton property
        const result = jsonData.find(item => urlToFind.includes(item.url))?.paginationButton;

        if (!result) {
          console.log("Not found");
          // Stop the loop if there is no next page button
          break;
        }

        // Find the next page button
        const nextPageButton = await driver.findElement({ xpath: result });
        if (nextPageButton) {
          console.log("Found");
          // Click the next page button
          await driver.executeScript("arguments[0].click();", nextPageButton);

          // Wait for the page to load
          await driver.sleep(3000);
        } else {
          console.log("Not found");
          // Stop the loop if there is no next page button
          break;
        }
      } catch (error) {
        console.error(`Error retrieving links from ${url}: ${error.message}`);
        break;
      }
    }
  } catch (error) {
    console.error(`Error retrieving links from ${url}: ${error.message}`);
  }
  finally {
    return [...allLinks]; // Convert the Set back to an array before returning
  }
}
