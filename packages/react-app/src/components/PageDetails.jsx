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

  const itemData = ["Round 1 out of 5"];

  const data = [
    {
      title: "Ant Design Title 1",
    },
    {
      title: "Ant Design Title 2",
    },
    {
      title: "Ant Design Title 3",
    },
    {
      title: "Ant Design Title 4",
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
            let color = tag.length > 5 ? "geekblue" : "green";
            if ((tag === "Staking") & (typeof tag !== "number")) {
              color = "volcano";
              return (
                <Tag color={color} key={tag}>
                  {tag.toUpperCase()}
                </Tag>
              );
            }
            if (typeof tag !== "number") {
              return (
                <Text color={color} key={tag}>
                  {tag}
                </Text>
              );
            }
            if (typeof tag === "number") {
              return (
                <Text color={color} key={tag}>
                  {tag}
                </Text>
              );
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
      tags: ["Staking"],
    },
    {
      key: "2",
      name: "Stake Value",
      tags: [100],
    },
    {
      key: "3",
      name: "Total Stake Duration",
      tags: ["30 Days"],
    },
  ];

  const [form] = Form.useForm();

  const handleChange = () => {
    form.setFieldsValue({ sights: [] });
  };

  const onFinish = values => {
    console.log("Values of form:", props.tx, values.kittens[0].walletAddress);
    // for now call a dummy contract and upon success call the notification with a success/fail message.

    values.kittens.map(addressObject => {
      console.log("Wallet Addresses", addressObject.walletAddress);
      try {
        props.tx(props.writeContracts.LotteryWinner.add(addressObject.walletAddress));
        openNotification("Adding Kitten", "Adding Kitten with address :" + addressObject.walletAddress);
      } catch (e) {
        openNotification("Error", e);
      }
      return true;
    });
    // props.tx(props.writeContracts.LotteryWinner.add(values.kittens[0].walletAddress));
    console.log("called tx");
  };
  const { Option } = Select;

  return (
    <div>
      <Form form={form} name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off">
        <Card title="Kitty Party Info">
          <Table columns={columns} dataSource={tableData} showHeader={false} pagination={false} />

          <Divider />
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
                  <List.Item.Meta
                    title={<a href="https://ant.design">{item}</a>}
                    description="Staking will finish in 8 days!"
                  />
                </List.Item>
              );
            }}
          />
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Pay Pending Amount <ApartmentOutlined />
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
