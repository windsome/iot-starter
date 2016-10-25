import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import classes from './List.scss'

export class LockInfo extends Component {
    componentDidMount () {
        console.log ("componentDidMount");
        var lockId = this.props.params.lockId;
        const { fetchLockIfNeeded } = this.props;
        fetchLockIfNeeded && fetchLockIfNeeded (lockId);
    }

    render () {
        var lockId = this.props.params.lockId;
        const { dbLocks, fetchLockIfNeeded, current } = this.props;
        console.log ("render", current);
        var lock = dbLocks && current && dbLocks[current];
        var btnClass = classes.btnHspace + " btn btn-primary"; // default, primary, success, info, warning, danger, link

        return (
  <div>
    { JSON.stringify(lock) }
  </div>
        );
    }
}

LockInfo.propTypes = {
    dbLocks: React.PropTypes.object,
    current: React.PropTypes.string,
    fetchLockIfNeeded: React.PropTypes.func.isRequired
}
