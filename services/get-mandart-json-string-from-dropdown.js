// services/get-mandart-json-string-from-dropdown.js
// Loads a MandArt file from a dropdown selection.

import { getMandartJsonStringFromDropDown } from './services/get-mandart-json-string-from-dropdown.js';
import { getUIElement } from '../globals.js';
import { setCatalogSelection } from '../state/state-dropdown-file-select.js';
import { getMandartJsonStringFromUrl } from './get-mandart-json-string-from-url.js';

/**
 * Loads a MandArt file based on dropdown selection.
 * @returns {Promise<string|null>} JSON string of the selected file or null if failed.
 */
export async function getMandartJsonStringFromDropDown() {
    //get the selected value from the dropdown
    // only a label like entry is displayed in the dropdown
    // but the value is the URL of the file
       // Get the file selection dropdown element
       const fileSelect = getUIElement('fileSelect'); 
       // Retrieve the selected value (which is the URL of the file)
       const selectedValue = fileSelect?.value;
       
       console.log("Dropdown selected value:", selectedValue);

     try {
            console.log(`📂 PROCESS-CATALOG: Loading file "${itemName}" from catalog...`);
            const fileUrl = await getUrlFromCatalogSelection(itemName);
            if (!fileUrl) {
                throw new Error(`❌ PROCESS-CATALOG: No URL found for "${itemName}"`);
            }
            setCatalogSelection(fileUrl);
            const jsonString = await getMandartJsonStringFromUrl(fileUrl);
            if (!jsonString) {
                throw new Error(`❌ PROCESS-CATALOG: Failed to fetch data from URL: ${fileUrl}`);
            }
            console.log(`✅ PROCESS-CATALOG: Successfully loaded "${itemName}"`);
            console.log("📂 CLICK !!! DROPDOWN andArt file from dropdown selection...");
            const fileSelect = getUIElement('fileSelect'); 
           // const selectedValue = fileSelect?.value;
            return jsonString;
        } catch (error) {
            console.error("❌ PROCESS-CATALOG: Error processing file from catalog:", error.message);
            return null;
        }
    
}
