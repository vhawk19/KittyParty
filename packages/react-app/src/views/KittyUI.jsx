/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useEffect , useState} from "react";
import { BrowserRouter as Router, Route, useRouteMatch, Switch, Redirect } from "react-router-dom";
import { Button, List} from "antd";
import { Address, CreateRoom, PageDetails, Account} from "../components";
import background from "../img/catpaw.jpg";
import {
  useEventListener,
} from "../hooks";

export default function KittyUI({
  address,
  mainnetProvider,
  userProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  blockExplorer
}) {
  let { path, url } = useRouteMatch();
    // 📟 Listen for broadcast events

    const setKittyPartyVerifiedEvent = useEventListener(readContracts, "KittyParty", "Verified", localProvider, 1);
    // const setKittyPartyDepositEvent = useEventListener(readContracts, "KittyParty", "Deposit", localProvider, 1);
    console.log("📟 SetPurpose events:", setKittyPartyVerifiedEvent);
    // console.log("📟 SetPurpose events:", setKittyPartyDepositEvent);
    const [oldPurposeEvents, setOldPurposeEvents] = useState([]);
  
    useEffect(() => {
      if(setKittyPartyVerifiedEvent && setKittyPartyVerifiedEvent !== oldPurposeEvents){
        console.log("📟 SetPurpose events:",setKittyPartyVerifiedEvent)
        setOldPurposeEvents(setKittyPartyVerifiedEvent)
      }
    });
  // useEffect(() => {
  //   const goToDashboard = () => navigate('/kittyui/dashboard');
  //   if (web3Modal.cachedProvider) {
  //     //the user has logged in navigate to kitty dashboard
  //     goToDashboard();
  //   }
  // }, [navigate]);
  
  function PrivateRoute({ children, ...rest }) {
    // let auth = useAuth(); -- using cacheProvider as a simpler auth mechanism
    return (
      <Route
        {...rest}
        render={({ location }) =>
         web3Modal.cachedProvider ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: "/kittyui",
                state: { from: location }
              }}
            />
          )
        }
      />
    );
  }

  
  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64,  backgroundImage: `url(${background})`}}>
      {/* web3Modal.cachedProvider: {web3Modal.cachedProvider} */}
     <Router>
        <Switch>
        <Route path={`${path}/create-room`}>
            <CreateRoom
            address={address} 
            tx={tx} 
            writeContracts={writeContracts} 
            readContracts={readContracts}></CreateRoom>
          </Route>
          <Route path={`/kittyui/dashboard`}>
            Welcome to the party {address}
            <PageDetails 
            address={address}
            tx={tx} 
            writeContracts={writeContracts} 
            readContracts={readContracts}></PageDetails>
          </Route>
        <Route path="/kittyui">
          {
          web3Modal.cachedProvider ? <Redirect to={`${path}/dashboard`} /> : 
          <Account
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
        }
       
          </Route>
 

        
          
        </Switch>
        </Router>

      </div>


      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <h2>Party Event Updates</h2>
        <List
          bordered
          dataSource={setKittyPartyVerifiedEvent}
          renderItem={item => {
            return (
              <List.Item key={item.blockNumber + "_" + "Verification state _" + item.verificationState}>
                
                {"Party has been verified (kreator has put up capital) - " + item.verificationState}
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}
