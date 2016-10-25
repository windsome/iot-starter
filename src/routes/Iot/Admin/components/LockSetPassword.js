import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import classes from './List.scss'
import { Field, reduxForm } from 'redux-form'

export class LockSetPasswordForm extends Component {
    componentWillMount () {
        var lockId = this.props.params.lockId;
        if (lockId) {
            const { tempdataSet } = this.props;
            tempdataSet ({id:lockId, password:'888888'});
        }
    }
    render () {
        var lockId = this.props.params.lockId;
        const { tryAdminSetPassword, handleSubmit, pristine, reset, submitting, tempdataSet, initialValues } = this.props;

        return (
<form className="form-inline" onSubmit={handleSubmit(tryAdminSetPassword)}>
  <div className="form-group">
    <label className="sr-only">Password</label>
    <p className="form-control-static">Password </p>
  </div>
    {'  '}
  <div className="form-group">
    <label htmlFor="inputPassword2" className="sr-only">Password</label>
    <Field name="password" component="input" type="text" className="form-control" placeholder="Password"/>
    <Field name="id" component="input" type="hidden" className="form-control" placeholder="id"/>
    {/*<input type="password" className="form-control" id="inputPassword2" placeholder="Password">*/}
  </div>
    {'  '}
  <button type="submit" className="btn btn-default" disabled={ pristine || submitting }>Submit</button>
  {/*<button type="submit" className="btn btn-default">Confirm</button>*/}
</form>    
        );
    }
}

LockSetPasswordForm.propTypes = {
    tempdataSet: React.PropTypes.func.isRequired,
    tryAdminSetPassword: React.PropTypes.func.isRequired
}

export default reduxForm({
    form: 'lockSetPassword',  // a unique identifier for this form
    enableReinitialize: true
})(LockSetPasswordForm)
