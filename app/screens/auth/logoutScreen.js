import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { connect } from 'react-redux';
import { logoutUser } from './../../redux/actions';

import Auth from './../../util/auth';
import Header from './../../components/header';

class LogoutScreen extends Component {
  componentDidMount() {
    this.props.logoutUser();
    this.onLogoutComplete(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.onLogoutComplete(nextProps);
  }

  onLogoutComplete(props) {
    if (!props.token) {
      this.props.navigation.navigate('InitialScreen');
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Header navigation={this.props.navigation} title="Log out" />
        <View style={styles.container}>
          <Text style={{ fontSize: 30 }}>Logging Out</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

const mapStateToProps = ({ auth }) => {
  return auth;
};

export default connect(mapStateToProps, { logoutUser })(LogoutScreen);
