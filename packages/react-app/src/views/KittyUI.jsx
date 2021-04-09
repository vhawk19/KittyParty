/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, useRouteMatch, Switch, Redirect } from "react-router-dom";
import { Button, List} from "antd";
import { Address, CreateRoom, PageDetails, Account} from "../components";

export default function KittyUI({
  winner,
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
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>

     <Router>
        <Switch>
        {/* <PrivateRoute path={`${path}/:create-room`}>
            <CreateRoom 
            tx={tx} 
            writeContracts={writeContracts} 
            readContracts={readContracts}></CreateRoom>
          </PrivateRoute> */}
          <PrivateRoute path={`${path}/dashboard`}>
            Dashboard
            <PageDetails 
            tx={tx} 
            writeContracts={writeContracts} 
            readContracts={readContracts}></PageDetails>
          </PrivateRoute>
          <Route path="/kittyui">
          {
          web3Modal.cachedProvider ? <Redirect to={`${path}/dashboard`} /> :  <Account
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />}
       
          </Route>
          <Route path="/kittyui/create-room">
           TEST
            {/* <CreateRoom 
            tx={tx} 
            writeContracts={writeContracts} 
            readContracts={readContracts}></CreateRoom> */}
          </Route>
        </Switch>
        </Router>

      </div>

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in LotteryWinner.sol! )
      */}
      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <h2>Events:</h2>
        <List
          bordered
          // dataSource={setPurposeEvents}
          renderItem={item => {
            return (
              <List.Item key={item.blockNumber + "_" + item.sender + "_" + item.purpose}>
                <Address address={item[0]} ensProvider={mainnetProvider} fontSize={16} /> =>
                {item[1]}
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}
