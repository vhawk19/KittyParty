import React, { useState, useEffect } from "react";
import { Button, Card, Divider, Form, Input, Space, Select, notification } from "antd";
import { MinusCircleOutlined, PlusOutlined, ApartmentOutlined, GoldOutlined, FileDoneOutlined, DashboardOutlined, SaveTwoTone } from "@ant-design/icons";
import { parseUnits } from "@ethersproject/units";
import AddressInput from "./AddressInput";

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

<CreateRoom
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

export default function CreateRoom(props) {
  const [potAmount, setPotAmount] = useState(0);

  // useEffect(() => {
  //   // Update the document title using the browser API
  //   if(potAmount > 0)
  //   openNotification("pot got new value", "Value is "+potAmount)
  // }, [potAmount]);

  const openNotification = (msg, msgDesc = "All is well!") => {
    notification.open({
      message: msg,
      description: msgDesc,
      onClick: () => {
        console.log("Notification Clicked!");
      },
    });
  };

  const [form] = Form.useForm();

  const handleChange = () => {
    form.setFieldsValue({ sights: [] });
  };

  const onFinish = values => {
    console.log("Values of form:", values.kittens[0].walletAddress, parseUnits(values.potAmount, "ether"));
    // for now call a dummy contract and upon success call the notification with a success/fail message.
    const kittens = values.kittens;

    setPotAmount(values.potAmount);
    const walletArray = [];
    values.kittens.map(addressObject => {
      walletArray.push(addressObject.walletAddress);
    });
    console.log("Wallet Addresses", kittens);
    try {
      props.tx(props.writeContracts.KittyParty.initialize(walletArray, parseUnits(values.potAmount, "ether")));
      openNotification("Adding Party Info", "Creating a new Party! Hang tight!");
    } catch (e) {
      openNotification("Error", e);
    }
    return true;
    // });
    // props.tx(props.writeContracts.LotteryWinner.add(values.kittens[0].walletAddress));
    console.log("called tx");
  };

  const makeDeposit = values => {
    try {
      if (potAmount > 0) {
        props.tx(props.writeContracts.KittyParty.depositAmount(parseUnits(potAmount, "ether")));
        openNotification(
          "Deposit Initiated",
          "Deposit initiated for " + potAmount + " from your address" + props.address,
        );
      } else {
        openNotification("Create a room with a pot first");
      }
    } catch (e) {
      openNotification("Error", e);
    }
    return true;
    console.log("called tx");
  };

  const verify = values => {
    try {
      props.tx(props.writeContracts.KittyParty.verify());
      openNotification("Party Verification Started", "Please check in events below for verification status");
    } catch (e) {
      openNotification("Error", e);
    }
    return true;
    console.log("called tx");
  };
  const { Option } = Select;

  return (
    <div>
      <Form form={form} name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off">
        <Card
          title="Kitty Party Info"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.0)", border: 0 }}
          headStyle={{ backgroundColor: "rgba(0, 0, 0, 0.0)", border: 0 }}
          bodyStyle={{ backgroundColor: "rgba(0, 0, 0, 0.0)", border: 0 }}
        >
          <Form.Item name="potAmount" label="Kitty pot amount" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Divider />
          <Form.List name="kittens">
            {(fields, { add, remove }) => (
              <>
                {fields.map(field => (
                  <Space key={field.key} align="baseline">
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, curValues) =>
                        prevValues.area !== curValues.area || prevValues.sights !== curValues.sights
                      }
                    >
                      {() => (
                        <Form.Item
                          {...field}
                          name={[field.name, "walletAddress"]}
                          fieldKey={[field.fieldKey, "walletAddress"]}
                          rules={[{ required: true, message: "Missing wallet Address" }]}
                        >
                          <AddressInput placeholder="address" style={{ width: "60%" }} />
                        </Form.Item>
                      )}
                    </Form.Item>

                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}

                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Kitten (5 kittens left)
                  </Button>
                </Form.Item>
                <Button type="text" htmlType="submit" block>
                  Save Draft <SaveTwoTone />
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            1. Create Party Room <ApartmentOutlined />
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="dashed" onClick={() => makeDeposit()} block>
            2. Stake an upfront amount
            <GoldOutlined />
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="dashed" onClick={() => verify()} block>
            3. Verify and Kickstart   <FileDoneOutlined />
          </Button>
        </Form.Item>
        <Form.Item>
        <Button type="dashed" href="/kittyui/cdashboard" block>
            4. Goto Dashboard <DashboardOutlined />
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
