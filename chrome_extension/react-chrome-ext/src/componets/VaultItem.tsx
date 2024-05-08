/* global chrome */
/* global chrome */
import Button from 'react-bootstrap/Button';

function VaultItem(props: any) {
    async function AutoFillLogin() {
        // console.log("sending message")
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        if (tab.id) chrome.tabs.sendMessage(tab.id, {
            username: props.account.username,
            password: props.account.password
        });
    }

    return (
        <div className="vault-item">
            <div>{props.account.account}</div>
            <div><Button variant="primary" onClick={AutoFillLogin}>Auto-Fill</Button></div>
        </div>
    );
}
  
export default VaultItem;