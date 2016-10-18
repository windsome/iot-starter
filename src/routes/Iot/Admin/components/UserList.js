import React, { Component, PropTypes } from 'react'
import classes from './List.scss'
import { Link } from 'react-router'

export class UserList extends Component {
    componentDidMount () {
        console.log ("componentDidMount");
        this.props.fetchUsers && this.props.fetchUsers (0, 10);
    }

    render () {
        var props = this.props;
        console.log ("Iot/Admin/component/UserList", this.props);
        var dbUsers = this.props.dbUsers;
        var { users } = this.props.user;

        return (
<div>
  <div>
    <button className='btn btn-default' onClick={props.fetchUsers.bind(undefined, 0, 10)}>
        { 'Fetch Users: ' } { users && (users.length+'') }
    </button>
    {' '}
  </div>
  {users && users.length > 0
   ? <div className={classes.savedWisdoms}>
       <h3>User List</h3>
       <ul>
         {users.map(user=>
           <li className='row' key={user}>
             <div className='col-sm-6 col-lg-6'>
               <Link to={'/iot/admin/user/'+user} activeClassName={classes.activeRoute}>{user}</Link>
             </div> 
             <div className='col-sm-6 col-lg-6'>{dbUsers[user].info} </div>
           </li>
         )}
       </ul>
     </div>
   : null
  }
</div>
        );
    }
}

UserList.propTypes = {
    dbUsers:React.PropTypes.object,
    user:React.PropTypes.object,
    fetchUsers: React.PropTypes.func.isRequired
}
