import NavBar from "./componets/NavBar";
import VaultItem from "./componets/VaultItem";


// var vault = [
//     {
//         ID: 1,
//         account: "Oregon State",
//         username: "bohrerja",
//         password: "not my actual password",
//         notes: ""
//     },
//     {
//         ID: 2,
//         account: "Email",
//         username: "jmoney420@gmail.com",
//         password: "password1",
//         notes: "Security question answer is: Ratatouille"
//     },
//     {
//         ID: 3,
//         account: "Lego",
//         username: "jmoney420@gmail.com",
//         password: "#v*$dw5x@nM&7Y3^neoU",
//         notes: ""
//     },
// ]

function VaultScreen(props: any) {
    var vault = props.vault as Array<Object>
    return (
        <div>
            <NavBar></NavBar>
            <div className="screen-container">
                {vault.map(item => {
                return(
                    <VaultItem account={item} />
                )
                })}
            </div>
        </div>
    );
}
  
export default VaultScreen;