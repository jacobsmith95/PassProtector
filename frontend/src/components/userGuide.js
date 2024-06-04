import React from "react";

export const UserGuide = () => {
    return ( 
    
    <div className="container w-50 fs-5 mt-5">
        <div className="text-left">
            <div><b>Steps to install and activate the Google Chrome extension:</b></div>
            <br></br>
            <div className="text-danger "><b><i>Note: This is for developers to use until the extension is approved in the app store.</i></b></div>
            <br></br>
            <ol>
                <li>Clone the GitHub repository to your local machine. </li>
                <li>Navigate to ./chrome_extension/react-chrome-ext/dist in your cloned GitHub repository.</li>
                <li>Go to your Google Chrome browser and navigate to "Manage extensions".</li>
                <ol type="a">
                    <li>In the top right, switch to enable Developer mode.</li>
                    <li>In the top left and select "Load Unpacked".</li>
                </ol>
                <li>Navigate to the ./dist directory from earlier and select it.</li>
                <li>Go back to your Google Chrome browser and navigate to "Manage extensions".</li>
                <li>Select the extension and activate it.</li>
            </ol>
        </div>
    </div>   
    
    );
}
