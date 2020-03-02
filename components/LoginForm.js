import Router from "next/router";
import { loginUser } from "../lib/auth";

export default class LoginForm extends React.Component {
  state = {
    email: "Sincere@april.biz",
    password: "hildegard.org",
    error: "",
    isLoading: false
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();

    const { email, password } = this.state;

    this.setState({
      error: "",
      isLoading: true
    });

    loginUser(email, password)
      .then(() => {
        Router.push("/profile");
      })
      .catch(this.showError);
  };

  showError = err => {
    const error = (err.response && err.response.data) || err.message;
    this.setState({
      error,
      isLoading: false
    });
    console.log("error: ", err);
  };

  render() {
    const { email, password, error, isLoading } = this.state;

    return (
      <form action="" onSubmit={this.handleSubmit}>
        <div>
          <input
            type="email"
            name="email"
            placeholder="email"
            value={email}
            onChange={this.handleChange}
          />
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="password"
            value={password}
            onChange={this.handleChange}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Sending" : "Submit"}
        </button>

        {error && <div>{error}</div>}
      </form>
    );
  }
}