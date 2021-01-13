import React, { Component } from 'react'
import * as moment from 'moment'

import { db } from '../../firebase.js';

import { DropdownDate, DropdownComponent } from 'react-dropdown-date';

import './CommitmentRecord.css';


export default class CommitmentRecord extends Component {
  constructor(props) {
    super(props)
    this.state = {
      year: null,
      month: null,
      day: null, 
      selectedDate: this.formatDate(new Date()), 
      dwTime: "",
      dailyProgress: "",
      weeklyDWTotal: 0,
    }
    this.props = {
    }

    this.addDailyCommitment = this.addDailyCommitment.bind(this)  

  }  

  componentDidMount() {
    this.calculateCurrentWeeklyTotalTime()
  }


  // *** For MANIPULATING Date and Time ***

  formatDate (date) {	// formats a JS date to 'yyyy-mm-dd'
  // data Param 
  // = When the Component did Mount, it is Passed from this.ccalculateCurrentWeeklyTotalTime()
  // = When the date input changed, Passed from <DropdownDate>/onDateChange Event Handler Property 
    var d = new Date(date),   
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = '' + d.getFullYear();
      console.log(month)
      // -> 1
      console.log(typeof(month))
      // -> string

      // month = (d.getMonth() + 1),
      // day = d.getDate(),
      // year = d.getFullYear();
       
      // console.log(month)
      // // -> 1 
      // console.log(typeof(month))
      // // -> number
      
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    
    console.log([year, month, day].join('-'))

    return [year, month, day].join('-');
    // This is String Data Type
    // => CAN be used directly as the Firebase/Firestore/Document names
  }

   calculateCurrentWeeklyTotalTime () {     
     let dates = [];
     let formatedDates = [];

      // Get the DATES in the CURRENT Week.
      var startOfWeek = moment().startOf('isoWeek');
      var endOfWeek = moment().endOf('isoWeek');    
      var day = startOfWeek;
      
      while (day <= endOfWeek) {
          // console.log(day)
          dates.push(day.toDate());
          day = day.clone().add(1, 'd');
      }
      

      // Convert each date into the SAME format as the date saved in the Firestore (YYYY-MM-DD). 
      dates.map((date)=> {
        formatedDates.push(this.formatDate(date))
      })


      // FECTH the Document MATCHING to the weekly dates.
      formatedDates.map((date)=>{
        db.collection('commitment-record').doc(date).get()
        .then((res)=>{
          // console.log(res.data()['DW Time']);
          // Calculate the total of all the FETCHED dates. (weeklyDWTotalVariable)
          this.updateWeeklyDWTotal(res.data()['DW Time'])
          
        })
        
        .catch((error)=> {
          console.log(error)
        })

      })

   }


  // Update the State for the Weekly Total (weeklyDWTotal State).
  updateWeeklyDWTotal(dailyDWTotal) {
    // console.log(dailyDWTotal)

    this.setState((state, props)=> {
      return {weeklyDWTotal: state.weeklyDWTotal + dailyDWTotal}
    })
    
  }

  // *** For RECORDING Commit ***
  getDWTime(timeInput) {
    this.setState({
      dwTime: timeInput
    })
  }

    
  getDailyProgress(progressInput) {
    this.setState({
      dailyProgress: progressInput
    })
  }

  addDailyCommitment() {       
    let date = this.state.selectedDate;
    let dwTimeInNumber = parseInt(this.state.dwTime)
    
    db.collection('commitment-record').doc(date).set({
      "Date": this.state.selectedDate,
      "DW Time": dwTimeInNumber,
      "Daily Progress": this.state.dailyProgress,
    })

    this.setState({
      dwTime: "",
      dailyProgress: "",
    })
    

  }

  // deleteCommitments() {
  // //!!! The code underneath delete ALL the Documents 
  // db.collection('public-commitment')
  //   .get()
  //   .then(res => {
  //     res.forEach(element => {
  //       // element.ref.delete();
  //     });
  //   });
  // }
  
  render() {
    return (
      <div className="public_commitment_container">
        <div className="record">
          <div className="datepicker_container">

            <DropdownDate
              // startDate={                       // optional, if not provided 1900-01-01 is startDate
              //   '2020-12.25'                    // 'yyyy-mm-dd' format only
              // }
              // endDate={                         // optional, if not provided current date is endDate
              //   '2021-12-25'                    // 'yyyy-mm-dd' format only
              // }
              selectedDate={                    // optional
                this.state.selectedDate         // 'yyyy-mm-dd' format only
              }
              order={[                          // optional
                DropdownComponent.year,         // Order of the dropdowns
                DropdownComponent.month,
                DropdownComponent.day,
              ]}
              // onYearChange={(year) => {         // optional
              //   // console.log(year);
              // }}
              // onMonthChange={(month) => {       // optional
              //   // console.log(month);
              // }}
              // onDayChange={(day) => {           // optional
              //   // console.log(day);
              // }}
              onDateChange={(date) => {         // optional
                // console.log(date);
                this.setState(
                  { 
                    // date: date, 
                    selectedDate: this.formatDate(date), 
                    // selectedDate: date,
                  });
              }}
              ids={                             // optional
                {
                  year: 'select-year',
                  month: 'select-month',
                  day: 'select-day'
                }
              }
              names={                           // optional
                {
                  year: 'year',
                  month: 'month',
                  day: 'day'
                }
              }
              classes={                         // optional
                {
                  dateContainer: 'classes',
                  yearContainer: 'classes',
                  monthContainer: 'classes',
                  dayContainer: 'classes',
                  year: 'classes classes',
                  month: 'classes classes',
                  day: 'classes classes',
                  yearOptions: 'classes',
                  monthOptions: 'classes',
                  dayOptions: 'classes'
                }
              }
              defaultValues={                   // optional
                {
                  year: 'Select Year',
                  month: 'Select Month',
                  day: 'Select Day'
                }
              }
              options={                         // optional
                {
                  yearReverse: true,            // false by default
                  monthShort: true,             // false by default
                  monthCaps: true               // false by default
                }
              }
            />
          </div>

          {/* <label htmlFor="date">The Date</label>
          <input 
            id="date"
            className="date_input"
            placeholder="Type Date (YYYY.MM.DD)."
            value={this.state.date}
            onChange={(e)=>this.getDateInput(e.target.value)}
          ></input> */}

          <label htmlFor="time">Deep Work Time</label>
          <input 
            id="time"
            className="time_input"
            placeholder="Type Deep Work Hours (Natural Number)"
            value={this.state.dwTime}
            onChange={(e)=>this.getDWTime(e.target.value)}
          ></input>
          <label htmlFor="progress"> Daily Progress</label>
          <textarea
            id="progress"
            className="progress_input"
            placeholder="Type Daily Progress."
            value={this.state.dailyProgress}
            onChange={(e)=>this.getDailyProgress(e.target.value)}
          >
          </textarea>

          <button
            className="submit-button"
            onClick={this.addDailyCommitment}
          >
            Add
          </button>

          <div>Weekly Deep Work Time: {this.state.weeklyDWTotal}</div>

          {/* <button
            className="delete-button"
            onClick={this.deleteCommitments}
          >
            Delete
          </button> */}


        </div>    

       </div>      
    )
  }
}
