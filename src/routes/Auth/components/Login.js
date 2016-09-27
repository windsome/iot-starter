import { IndexLink, Link } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { Field, reduxForm } from 'redux-form'
import classes from './Login.scss'

export class LoginForm extends Component {
    componentDidMount () {
        console.log ("componentDidMount");
        //this.props.fetchDevices && this.props.fetchDevices (0, 10);
    }

    render () {
        const { handleSubmit, handleLogin, handleOauth2, pristine, reset, submitting, auth } = this.props;
        var props = this.props;
        console.log ("Auth/Login", this.props);

        var error = auth && auth.error && JSON.stringify(auth.error) || '';
        var token = auth && auth.token && JSON.stringify(auth.token) || '';
        //console.log ("error:" + error);
        //console.log ("token:" + token);
        return (
    <form onSubmit={ handleSubmit(handleLogin) }>
      <div>
        <label>Account</label>
        <div>
          <Field name="username" component="input" type="text" placeholder="Username"/>
        </div>
      </div>
      <div>
        <label>Password</label>
        <div>
          <Field name="password" component="input" type="password" placeholder="Password"/>
        </div>
      </div>
      <div>
        <button type="submit" disabled={pristine || submitting}>Submit</button>
        <button type="button" disabled={pristine || submitting} onClick={reset}>Clear Values</button>
        <button type="button" onClick={handleOauth2.bind(undefined, "snsapi_base")}>Login Wechat</button>
      </div>
      <Link to='/iot/device/list'>
        <div> DeviceList </div>
      </Link>

      <div> { error }
      </div>
      <div> { token }
      </div>
      
<div>
  <div>
    <h2 className={classes.zenHeader}>
      {props.zen ? props.zen.value : ''}
    </h2>
    <button type="button" className='btn btn-default' onClick={props.fetchZen}>
        { 'Fetch a wisdom: ' } { props.signpkg?JSON.stringify(props.signpkg):'' }
    </button>
    {' '}
    <button type="button" className='btn btn-default' onClick={props.saveCurrentZen}>
        Save
    </button>
  </div>
  {props.saved.length
   ? <div className={classes.savedWisdoms}>
       <h3>Saved wisdoms</h3>
       <ul>
         {props.saved.map(zen=>
           <li key={zen.id}> {zen.value} </li>
         )}
       </ul>
     </div>
   : null
  }
</div>
    </form>
        );
    }
}

LoginForm.propTypes = {
    zen:React.PropTypes.object,
    saved: React.PropTypes.array.isRequired,
    fetchZen: React.PropTypes.func.isRequired,
    saveCurrentZen: React.PropTypes.func.isRequired,
    signpkg:React.PropTypes.object
}

export default reduxForm({
    form: 'login'  // a unique identifier for this form
})(LoginForm)
