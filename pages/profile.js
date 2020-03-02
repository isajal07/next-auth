import { getUserProfile } from "../lib/auth";
import Layout from "../components/Layout";
import { authInitialProps } from "../lib/auth";

export default class Profile extends React.Component {
  state = {
    user: null
  };

  componentDidMount() {
    getUserProfile().then(user => this.setState({ user }));
  }

  render() {
    const { user } = this.state;
    const title =
      user && user.user.name ? `${user.user.name}'s Profile` : "Profile";

    return (
      <Layout title={title} {...this.props}>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </Layout>
    );
  }
}

Profile.getInitialProps = authInitialProps(true)