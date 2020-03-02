// This page is only executes on the server side

import Document, { Head, Main, NextScript } from "next/document";
import { getServerSideToken, getUserScript } from "../lib/auth";

export default class MyDocument extends Document {
  // All this complex shit below is just to get around not using redux and store the login info globally across components
  static async getInitialProps(ctx) {
    const props = await Document.getInitialProps(ctx);
    const userData = await getServerSideToken(ctx.req);

    return { ...props, ...userData };
  }

  render() {
    const { user = {} } = this.props;

    return (
      <html>
        <Head />
        <body>
          <Main />

          <script dangerouslySetInnerHTML={{ __html: getUserScript(user) }} />

          <NextScript />
        </body>
      </html>
    );
  }
}