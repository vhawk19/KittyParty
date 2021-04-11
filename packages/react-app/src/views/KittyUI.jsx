/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, useRouteMatch, Switch, Redirect } from "react-router-dom";

import { Button, List } from "antd";
import { Address, CreateRoom, PageDetails, Account } from "../components";
import background from "../img/catpaw.jpg";
import { useEventListener } from "../hooks";
import { KittyParty } from "../contracts/KittyParty.address.js";

const Dagger  = require("@maticnetwork/dagger");

export default function KittyUI({
  address,
  userProvider,
  localProvider,
  price,
  tx,
  readContracts,
  writeContracts,
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  blockExplorer,
}) {
  const { path, url } = useRouteMatch();
  // 📟 Listen for broadcast events
  const [oldPurposeEvents, setOldPurposeEvents] = useState([]);

  const dataEvent = [
    {
      "blockNumber": 1870123,
"verificationState" : true,
"desc": "Party has started collecting funds, kreator has staked"
    },

  ]

  // // const web3Contract = new web3.eth.Contract(KittyParty.abi, KittyParty.address);

  // let setKittyPartyVerifiedEvent = useEventListener(readContracts, "KittyParty", "Verified", localProvider, 1);
  const dagger = new Dagger("wss://rpc-mumbai.maticvigil.com/ws/v1/e152634d2ad0cb5e46bb2b62d5ca33994ffcc239");
  // dagger.on("latest:log/" + KittyParty, (res, flag) => {
  //   console.log("📟 dagger events:", res);
  //   setOldPurposeEvents(res);
  // });

  // console.log("📟 setKittyPartyVerifiedEvent events:", setKittyPartyVerifiedEvent);
  // // console.log("📟 SetPurpose events:", setKittyPartyDepositEvent);

  // useEffect(() => {
  //   if (setKittyPartyVerifiedEvent && setKittyPartyVerifiedEvent !== oldPurposeEvents) {
  //     console.log("📟 SetPurpose events:", setKittyPartyVerifiedEvent);
  //     setOldPurposeEvents(setKittyPartyVerifiedEvent);
  //   }
  // });
  // useEffect(() => {
  //   const goToDashboard = () => navigate('/kittyui/dashboard');
  //   if (web3Modal.cachedProvider) {
  //     //the user has logged in navigate to kitty dashboard
  //     goToDashboard();
  //   }
  // }, [navigate]);

  return (
    <div>
      <div
        style={{
          border: "1px solid #cccccc",
          padding: 16,
          width: 400,
          margin: "auto",
          marginTop: 64,
          backgroundImage: `url(${background})`,
        }}
      >
        {/* web3Modal.cachedProvider: {web3Modal.cachedProvider} */}
        <Router>
          <Switch>
            <Route path={`${path}/create-room`}>
              <CreateRoom address={address} tx={tx} writeContracts={writeContracts} readContracts={readContracts} />
            </Route>
            <Route path="/kittyui/dashboard">
              Welcome to the party{" "}
              <a target="_blank" href={`https://explorer-mumbai.maticvigil.com/address/${address}/transactions`}>
                {address}
              </a>
              <PageDetails address={address} tx={tx} writeContracts={writeContracts} readContracts={readContracts} />
            </Route>
            <Route path="/kittyui">
              {web3Modal.cachedProvider ? (
                <Redirect to={`${path}/dashboard`} />
              ) : (
                <Account
                  address={address}
                  localProvider={localProvider}
                  userProvider={userProvider}
                  price={price}
                  web3Modal={web3Modal}
                  loadWeb3Modal={loadWeb3Modal}
                  logoutOfWeb3Modal={logoutOfWeb3Modal}
                  blockExplorer={blockExplorer}
                />
              )}
            </Route>
          </Switch>
        </Router>
      </div>

      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <h2>Party Event Updates</h2>
        <List
          bordered
          dataSource={dataEvent}
          renderItem={item => {
            return (
              <List.Item key={item.blockNumber + "_" + "Verification state _" + item.verificationState}>
                {item.desc +" - "+ item.verificationState}
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}
