import React, { useState } from "react";
import {
  Typography,
  Button,
  Card,
  Divider,
  Form,
  Input,
  Space,
  Select,
  notification,
  List,
  Avatar,
  Table,
  Tag,
} from "antd";

import { MinusCircleOutlined, PlusOutlined, ApartmentOutlined, SaveTwoTone } from "@ant-design/icons";
import { formatUnits } from "@ethersproject/units";

import tryToDisplay from "./Contract/utils";

import { useContractReader } from "../hooks";

import AddressInput from "./AddressInput";

const { Text } = Typography;
/*
~ What it does? ~

Two components
1. Add stake creation parameters
2. Create add address component
2a. Check address
2b. send an email to the address recipient

Finally,
3. Call the contract factory to create the kitty party room contract

If success display success toast notification
if error display error toast notification

~ How can I use? ~

<PageDetails
navigateTo={url}
tx={tx}
writeContracts={writeContracts}
readContracts={readContracts}              
/>

~ Features ~

- Allow parameters to be entered to call the create room contract
- Provide an interface to save to localstorage 
- Create the room and show success notification

*/

export default function PageDetails(props) {
  const openNotification = (msg, msgDesc = "All is well!") => {
    notification.open({
      message: msg,
      description: msgDesc,
      onClick: () => {
        console.log("Notification Clicked!");
      },
    });
  };
  // console.log("🤗 status:", props.readContracts);

  /**
   * Contract related variable declaration and save
   *
   */
  const KittyPartyState = Object.freeze({
    Verification: 0,
    Collection: 1,
    Staking: 2,
    Payout: 3,
    Completed: 4,
    Trap: 5,
  });

  const KittyPartyAction = Object.freeze({
    "Please wait for verification!": 0,
    "Please click pay pending amount and pay your kitty 💰. If already paid please wait for others!": 1,
    "Staking in progress, wait till status changes": 2,
    "The winner has been decided! ": 3,
  });

  let currentRound = useContractReader(props.readContracts, "KittyParty", "currentRound");
  currentRound = tryToDisplay(currentRound || 0) + 1;

  let amountPerRound = useContractReader(props.readContracts, "KittyParty", "amountPerRound");
  amountPerRound = tryToDisplay(amountPerRound || 0);
  const amountPerRoundDisplay = formatUnits(amountPerRound, "ether");

  let UniBalance = useContractReader(props.readContracts, "KittyParty", "checkUniBalance");
  UniBalance = formatUnits(tryToDisplay(UniBalance || 0), "ether");

  const KittyPartyCurrentState = useContractReader(props.readContracts, "KittyParty", "getStatus");
  const getStatus = value => {
    return Object.keys(KittyPartyState).find(key => KittyPartyState[key] === value);
  };
  const currentStatus = getStatus(KittyPartyCurrentState);
  const getNextAction = value => {
    return Object.keys(KittyPartyAction).find(key => KittyPartyAction[key] === value);
  };
  const nextAction = getNextAction(KittyPartyCurrentState);

  let noOfMembers = useContractReader(props.readContracts, "KittyParty", "getLength");
  noOfMembers = noOfMembers > 100000 ? 0 : noOfMembers;
  const itemData = ["Round " + currentRound + " out of - " + noOfMembers];

  let currentBalance = useContractReader(props.readContracts, "KittyParty", "getBalance", [props.address]);
  currentBalance = tryToDisplay(currentBalance || 0);
  const currentBalanceDisplay = formatUnits(currentBalance, "ether");
  const isPendingPayment = () => {
    return KittyPartyCurrentState === 1 && amountPerRound > currentBalance;
  };

  const isPendingPaymentFlag = isPendingPayment();

  console.log("my address --- ", currentBalance);
  const data = [
    {
      title: "Ant Design Title 1",
    },
    {
      title: "Ant Design Title 2",
    },
  ];

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: text => <a>{text}</a>,
    },
    {
      title: "Tags",
      key: "tags",
      dataIndex: "tags",
      render: tags => (
        <>
          {tags.map(tag => {
            if (typeof tag !== "number") {
              const color = "green";
              // tag === "Staking" ? (color = "volcano") : null;

              return (
                <Tag color={color} key={tag}>
                  {tag}
                </Tag>
              );
            }

            if (typeof tag === "number") {
              return <Text key={tag}>{tag}</Text>;
            }
          })}
        </>
      ),
    },
  ];

  const tableData = [
    {
      key: "1",
      name: "Status",
      tags: [currentStatus],
    },
    {
      key: "2",
      name: "Amount Per Round",
      tags: [amountPerRoundDisplay],
    },
    {
      key: "3",
      name: "Stake Token Value",
      tags: [UniBalance],
    },
    {
      key: "4",
      name: "Current Balance",
      tags: [currentBalanceDisplay],
    },
  ];

  // const [form] = Form.useForm();

  // const handleChange = () => {
  //   form.setFieldsValue({ sights: [] });
  // };

  const makePayment = values => {
    try {
      console.log("transaction", props.tx);
      props.tx(props.writeContracts.KittyParty.depositAmount(amountPerRound));
      openNotification(
        "Deposit Initiated",
        "Deposit initiated for " + amountPerRoundDisplay + " from your address" + props.address,
      );
    } catch (e) {
      openNotification("Error", e);
    }
    return true;
    console.log("called tx");
  };
  // const { Option } = Select;

  return (
    <div>
      {/* <Form form={form} name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off"> */}
      <Card title="">
        <Table columns={columns} dataSource={tableData} showHeader={false} pagination={false} />
      </Card>
      <div style={{ margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <h2 />
        <List
          dataSource={itemData}
          bordered
          // dataSource={setPurposeEvents}
          renderItem={item => {
            return (
              <List.Item>
                <List.Item.Meta title={<p>{item}</p>} description={nextAction} />
              </List.Item>
            );
          }}
        />
      </div>
      {/* <Form.Item> */}
      <Button type="primary" htmlType="submit" onClick={() => makePayment()} block disabled={!isPendingPaymentFlag}>
        Pay Pending Amount <ApartmentOutlined />
      </Button>
      {/* </Form.Item> */}
      {/* </Form> */}
    </div>
  );
}
