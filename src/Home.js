import React, { Component } from 'react'
import firebase from 'firebase'

import { auth } from './firebase.js'
import CommitmentRecord from './components/CommitmentRecord/CommitmentRecord';

export default class Home extends Component {
  constructor(context, props) {
    super(context, props)
    this.state = {
      email: "",
      pwd: "",
      singedInUser: null,
    }

  }

  componentDidMount() {    
    this.trackUserSignIn()
  }


  activateSignInWithEmailAndPWD() {    
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
      return auth.signInWithEmailAndPassword(this.state.email, this.state.pwd)
      .then((response)=>{
        console.log('Signed in: ', response)      
        this.trackUserSignIn()
      })  
      .catch((error)=>{
        console.log(error)
      })
    })
    .catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(`Erorr Code: ${errorCode}, Erorr Message ${errorMessage} `)
    });
  }


  activateSignOut() {
    auth.signOut()
    .then((response)=>{
      console.log("Signed out")      
      this.trackUserSignIn()
    })
    .catch((error)=>{
      console.log(error)
    })
  }

  trackUserSignIn() {
    auth.onAuthStateChanged((user)=>{
      if (user) {
      this.setState({
        singedInUser: user,
      })
        console.log(user)
      } else {
      this.setState({
        singedInUser: false,
      })
      }
      })
  }

  render() {
    return (
      <div> 

        {!this.state.singedInUser ? 
          <div>
            <input 
            onChange={(e)=> this.setState({
              email: e.target.value
            })} 
            placeholder="Enter your email"
            ></input>
            <input 
            onChange={(e)=> this.setState({
              pwd: e.target.value
            })} 
            placeholder="Enter your PWD"
            ></input>
          <button onClick={()=> this.activateSignInWithEmailAndPWD()}>Sign in</button>
          </div>  
          : 

          <div>
            <CommitmentRecord />
            <button onClick={()=> this.activateSignOut()}>Sign out</button>
          </div>
        
        }
        {/* {
          this.state.signedIn == "Signed-in" &&
          <div>
            <CommitmentRecord />
            <button onClick={()=> this.activateSignOut()}>Sign out</button>
          </div>
        }  */}
      </div>
    )
  }
}
