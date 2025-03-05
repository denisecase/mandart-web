// app_state_manager.js
// A simple state manager that doesn't interfere with existing code

// Create a namespace for our app state
window.MandArtState = window.MandArtState || {
    // Current filename/label
    currentFilename: "mandart",
    
    // Flag to track if the current state has been modified since loading
    isModified: false,
    
    // Last loaded file from dropdown
    lastLoadedFile: null,
    
    // Set the current filename and update UI
    setCurrentFilename: function(filename) {
        if (!filename) return;
        
        // Clean up the filename
        const parts = filename.split('/');
        const filenameWithExt = parts[parts.length - 1];
        const cleanName = filenameWithExt.replace(/\.(mandart|json)$/i, "");
        
        this.currentFilename = cleanName;
        console.log(`APP_STATE: Set current filename to "${cleanName}"`);
        
        // Update the document title
        document.title = `MandArt Web - ${cleanName}`;
        
        // Update canvas title if it exists
        const canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.title = cleanName;
        }
    },
    
    // Mark the current state as modified
    markAsModified: function() {
        this.isModified = true;
        
        // You could add a visual indicator to the UI here
        // For example, add an asterisk to the title
        if (!document.title.includes('*')) {
            document.title = document.title + ' *';
        }
    },
    
    // Reset the modified flag
    resetModifiedFlag: function() {
        this.isModified = false;
        
        // Remove the asterisk from the title
        document.title = document.title.replace(' *', '');
    },
    
    // Get the proper filename for saving
    getFilenameForSave: function() {
        return this.currentFilename || "mandart";
    },
    
    // Handle file loaded from dropdown
    handleFileLoaded: function(fileObj) {
        if (!fileObj) return;
        
        this.lastLoadedFile = fileObj;
        this.setCurrentFilename(fileObj.name || "mandart");
        this.resetModifiedFlag();
        
        console.log(`APP_STATE: File loaded - "${this.currentFilename}"`);
    }
};

// Function to initialize the state manager and set up listeners
export function initAppStateManager() {
    console.log("APP_STATE: Initializing app state manager");
    
    // Set default filename
    if (!window.MandArtState.currentFilename) {
        window.MandArtState.setCurrentFilename("mandart");
    }
    
    // Try to hook into color editor events to detect modifications
    setupColorEditorListeners();
    
    // Hook into file processing to update filename when a file is loaded
    hookIntoFileProcessing();
}

// Set up listeners for color editor changes
function setupColorEditorListeners() {
    try {
        // Listen for changes to color inputs
        const mandColorPicker = document.getElementById('mandColorPicker');
        if (mandColorPicker) {
            mandColorPicker.addEventListener('change', () => {
                window.MandArtState.markAsModified();
            });
        }
        
        // Listen for changes in the hue list
        const hueList = document.getElementById('hueList');
        if (hueList) {
            const observer = new MutationObserver(() => {
                window.MandArtState.markAsModified();
            });
            
            observer.observe(hueList, {
                childList: true,
                subtree: true,
                attributes: true
            });
        }
        
        // Listen for add color button
        const addColorBtn = document.getElementById('addColorBtn');
        if (addColorBtn) {
            addColorBtn.addEventListener('click', () => {
                window.MandArtState.markAsModified();
            });
        }
        
        console.log("APP_STATE: Set up color editor listeners");
    } catch (error) {
        console.error("Error setting up color editor listeners:", error);
    }
}

// Hook into file processing to update filename when a file is loaded
function hookIntoFileProcessing() {
    try {
        // Keep a reference to the original processFile function
        const originalProcessFile = window.processFile;
        
        if (typeof originalProcessFile === 'function') {
            // Replace with our own version that updates the filename
            window.processFile = async function(fileObj) {
                console.log("APP_STATE: processFile called with:", fileObj);
                
                // Call the original function
                await originalProcessFile(fileObj);
                
                // Update the app state
                window.MandArtState.handleFileLoaded(fileObj);
            };
            
            console.log("APP_STATE: Hooked into processFile function");
        } else {
            console.warn("APP_STATE: processFile function not found");
        }
    } catch (error) {
        console.error("Error hooking into file processing:", error);
    }
}