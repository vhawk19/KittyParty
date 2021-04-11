import React from "react";
import { PageHeader } from "antd";
import background from "../img/logo_sm.png";

// displays a page header

export default function Header() {
  return (
    <a href="/kttiyui" rel="noopener noreferrer">
      <PageHeader
        title=""
        subTitle="Parties with Kitties for Kitties made by Kittens"
        style={{ cursor: "pointer" }}
        avatar={{shape:"square", size:"large",src:background }}
      />
    </a>
  );
}
