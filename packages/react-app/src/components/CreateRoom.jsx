import React, { useState } from "react";
import { Button, Card, Divider, Form, Input, Space, Select, notification } from "antd";
import { MinusCircleOutlined, PlusOutlined, ApartmentOutlined, SaveTwoTone } from "@ant-design/icons";
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
          <Form.Item name="rounds" label="Number of rounds" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="note" label="Kitty pot amount" rules={[{ required: true }]}>
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
                    <Form.Item
                      {...field}
                      name={[field.name, "emailAddress"]}
                      fieldKey={[field.fieldKey, "emailAddress"]}
                      rules={[{ required: true, message: "Missing Email Address" }]}
                    >
                      <Input placeholder="email address" style={{ width: "100%" }} />
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
            Create Party Room <ApartmentOutlined />
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
