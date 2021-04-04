import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <a href="/kttiyui" rel="noopener noreferrer">
      <PageHeader
        title="Kitty Party"
        subTitle="Parties with Kitties for Kitties made by Kittens"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
