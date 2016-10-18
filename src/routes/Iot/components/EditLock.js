import React, { Component, PropTypes } from 'react'
import { Field, reduxForm } from 'redux-form'
import eq from 'lodash/eq'

class EditLockForm extends Component {
    shouldComponentUpdate (nextProps, nextState) {
        var initialValues = this.props.initialValues;
        var nextInitialValues = nextProps.initialValues;
        console.log ("EditLockForm shouldComponentUpdate", initialValues, nextInitialValues, eq(initialValues, nextInitialValues));
        return true;
    }

    componentWillReceiveProps (nextProps) {
        var initialValues = this.props.initialValues;
        var nextInitialValues = nextProps.initialValues;
        //console.log ("EditLockForm componentWillReceiveProps", initialValues, nextInitialValues, eq(initialValues, nextInitialValues));
    }
    //componentDidUpdate (prevProps) {
    //componentDidMount () {
    componentWillMount () {
        var lockId = this.props.params.lockId;
        if (lockId) {
            const { tempdataSet, dbLocks } = this.props;
            //console.log ("windsome", dbLocks);
            var lock = dbLocks[lockId];
            console.log ("windsome lockform", lock);
            tempdataSet (lock);
        }
    }
    render () {
        var userId = this.props.params.userId;
        var lockId = this.props.params.lockId;
        var dbLocks = this.props.dbLocks;
        const { pristine, reset, submitting, tempdataSet, initialValues } = this.props;
        console.log ("windsome EditLock render", lockId, initialValues);

        return (
<div>
  { lockId
    ? <h3>{ 'User '+userId+', Modify '+lockId }</h3>
    : <h3>{ 'User '+userId+', Create New Lock' }</h3>
  }
  <button type="button" onClick={() => { console.log("why?"); tempdataSet(dbLocks[lockId])} }>Load</button>
  <form>
      <div>
        <label>Info</label>
        <div>
          <Field name="info" component="input" type="text" placeholder="Info"/>
        </div>
      </div>
      <div>
        <Field name="owner" component="input" type="hidden" placeholder="owner"/>
      </div>
      <div>
        <button type="submit" disabled={pristine || submitting}>Submit</button>
        <button type="button" disabled={pristine || submitting} onClick={reset}>Clear Values</button>
      </div>
  </form>
</div>
        );
    }
}

EditLockForm.propTypes = {
    lock:React.PropTypes.object,
    fetchLocks: React.PropTypes.func.isRequired
}

export default reduxForm({
    form: 'lock',  // a unique identifier for this form
    enableReinitialize: true
})(EditLockForm)
