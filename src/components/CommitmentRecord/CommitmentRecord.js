import React, { Component } from 'react'
import * as moment from 'moment'

import { db } from '../../firebase.js';

import { DropdownDate, DropdownComponent } from 'react-dropdown-date';

import './CommitmentRecord.css';

// Key Logic 
// : Record each of Hour and Minute INDIVIDUALL.
// : Convert into HH:MM format when DISPLAYING the time (NOT when recording the time).

export default class CommitmentRecord extends Component {
  constructor(props) {
    super(props)
    this.state = {
      year: null,
      month: null,
      day: null, 
      selectedDate: this.formatDate(new Date()),       
      DWHourInput: "",
      DWMinuteInput: "",
      dailyProgressInput: "",
      weeklyDWTimeTotal: "",      
      recordResult: "",
    }
    this.props = {
    }

    this.addDailyCommitment = this.addDailyCommitment.bind(this)  

  }  

  componentDidMount() {
    this.calculateWeeklyDWHoursAndMinutesTotal()
  }



  // *** For MANIPULATING Date and Time ***

  formatDate (date) {	// formats a JS date to 'yyyy-mm-dd'
  // date Param 
    // = When the Component did Mount, it is Passed from this.ccalculateCurrentWeeklyTotalTime()
    // = When the date input changed, Passed from <DropdownDate>/onDateChange Event Handler Property 
    var d = new Date(date),   
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = '' + d.getFullYear();
      // console.log(month)
      // -> 1
      // console.log(typeof(month))
      // -> string
      
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
    // This is String Data Type
    // => CAN be used directly as the Firebase/Firestore/Document names
  }

  // *** Weekly DW Time ***
  calculateWeeklyDWHoursAndMinutesTotal() {  
    let weeklyDWHourTotal = 0;
    let weeklyDWMinutesTotal = 0;
    
    let weekDays = this.calculateTheCurrentWeek()

    // FECTH the Document MATCHING to the weekly dates.
    weekDays.map((weekDay)=>{
      db.collection('commitment-record').doc(weekDay).get()
      .then((res)=>{
        // console.log(res.data()['Date'])
        // console.log(res.data()['DW Hour'])
        weeklyDWHourTotal += parseInt(res.data()['DW Hour']) 
        // console.log("calculateWeeklyDWHoursAndMinutesTotal()/weeklyDWHourTotal", weeklyDWHourTotal) 

        weeklyDWMinutesTotal += parseInt(res.data()['DW Minute'])  
        // console.log("calculateWeeklyDWHoursAndMinutesTotal()/weeklyDWMinutesTotal", weeklyDWMinutesTotal)

        // console.log("weeklyDWHourTotal: ", weeklyDWHourTotal)
        let weeklyDWHourTotalInMinutes = this.convertDWHoursIntoMinutes(weeklyDWHourTotal)
        this.calculateWeeklyDWTimeTotal(weeklyDWHourTotalInMinutes, weeklyDWMinutesTotal)

      })  
      .catch((error)=> {
        console.log(error)
      })

    })

  }  

    
  calculateTheCurrentWeek() { 
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

    return formatedDates;
  }

  convertDWHoursIntoMinutes(weeklyDWHourTotal) {
  //  console.log("convertDWHoursIntoMinutes()/weeklyDWHourTotal: ", weeklyDWHourTotal)
    let weeklyDWHourTotalInMinutes = weeklyDWHourTotal * 60;
  //  console.log("convertDWHoursIntoMinutes()/weeklyDWHourTotalInMinutes", weeklyDWHourTotalInMinutes)

  return weeklyDWHourTotalInMinutes;
  }

  calculateWeeklyDWTimeTotal(weeklyDWHourTotalInMinutes, weeklyDWMinutesTotal) {
    
    // console.log("...A Day")
    // console.log("calculateWeeklyDWTimeTotal()/weeklyDWHoursTotalInMinutes: ", weeklyDWHourTotalInMinutes)
    // console.log("calculateWeeklyDWTimeTotal()/weeklyDWMinutesTotal: ", weeklyDWMinutesTotal)
    let weeklyDWTimeTotalInMinutes = weeklyDWHourTotalInMinutes + weeklyDWMinutesTotal;
    // let weeklyDWTimeTotalInMinutes = 71; 
      // Output: 1:11
    // let weeklyDWTimeTotalInMinutes = 1441; 
      // Output: 24:01
    // console.log("calculateWeeklyDWTimeTotal()/weeklyDWTimeTotalInMinutes: ", weeklyDWTimeTotalInMinutes)
    

    // Goal = Minutes (weeklyDWTimeTotalInMinutes) into HH:MM format.
    // Src: https://www.w3resource.com/javascript-exercises/javascript-basic-exercise-51.php
    let weeklyDWTimeTotalOfHours = Math.floor(weeklyDWTimeTotalInMinutes / 60)
    // console.log("calculateWeeklyDWTimeTotal()/weeklyDWTimeTotalOfHours (= weeklyDWTimeTotalInMinutes / 60): ", weeklyDWTimeTotalOfHours, "Hours") 

      // Goal = Get the Decimals as Minute Remainder from Division for hours (weeklyDWTImeTotalOfHours).
      // Src: https://stackoverflow.com/a/4512328/13710739
      let weeklyDWTimeTotalOfHoursWithDecimal = weeklyDWTimeTotalInMinutes / 60; 
      let weeklyDWDecimal = weeklyDWTimeTotalOfHoursWithDecimal - weeklyDWTimeTotalOfHours;
      // console.log("weeklyDWDecimal: ", weeklyDWDecimal)
    
    // Goal = Decimals into Minutes.  
    let weeklyDWTimeTotalOfMinutes = "" + Math.round(weeklyDWDecimal * 60);
      // Allows concatenating 0 before the minute of a SINGLE number. 
    if(weeklyDWTimeTotalOfMinutes.length < 2) {
      weeklyDWTimeTotalOfMinutes = "0" + weeklyDWTimeTotalOfMinutes
      // console.log(weeklyDWTimeTotalOfMinutes)
    }  
    
    // console.log("calculateWeeklyDWTimeTotal()/weeklyDWTimeTotalOfMinutes: ", weeklyDWTimeTotalOfMinutes, "Minutes") 

    // Goal = Concatenate Hours and Minutes into HH:MM format. 
    let weeklyDWTimeTotal = `${weeklyDWTimeTotalOfHours}:${weeklyDWTimeTotalOfMinutes} (= ${weeklyDWTimeTotalInMinutes} Minutes)`;
    // console.log("calculateWeeklyDWTimeTotal()/weeklyDWTimeTotal: ", weeklyDWTimeTotal)
    // console.log("Date Type of weeklyDWTimeTotal: ", typeof weeklyDWTimeTotal)

    // Goal = Update State with the result Weekly DW Time Total in HH:MM to 
    this.setState({
      weeklyDWTimeTotal: weeklyDWTimeTotal
    })
    
  }
    

  // *** For RECORDING Commit ***
  getDailyProgress() {
    let dailyProgress = `${this.state.dailyProgress}`;
    console.log("getDailyProgress()/dailyProgress", dailyProgress)

    return dailyProgress;
  }

  addDailyCommitment() {    
    // let DWTime = this.getDWTime()
    let dailyProgress = this.getDailyProgress()
    let date = this.state.selectedDate;
    
    db.collection('commitment-record').doc(date).set({
      "Date": this.state.selectedDate,
      "DW Hour": this.state.DWHourInput,
      "DW Minute": this.state.DWHourInput,
      "Daily Progress": dailyProgress,
    })
    .then((response)=> {
      this.setState({
        recordResult: 
        `
        Added the following...
        Daily DW Time = ${this.state.DWHourInput}:${this.state.DWMinuteInput}, 
        Daily Progress = ${this.state.dailyProgressInput}
        ...
        That's it!
        `
      })
    })
    .catch((error)=>{
      this.setState({
        recordResult: 
        `
        Recording failed...
        An erorr happened: ${error}
        ...
        Oh...
        `
        
      })
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
      <div>
        <div>Weekly Deep Work Time: {this.state.weeklyDWTimeTotal}</div>
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
          <div className="DWTime_input">
            <input 
              id="DWHour"
              className="DWhour_input"
              placeholder="Hour"
              onChange={(e)=> this.setState({
                DWHourInput: e.target.value,
              })}
            ></input>
            <div className="time_collon"> : </div>
            <input 
              id="DWMinute"
              className="DWminute_input"
              placeholder="Minute"
              onChange={(e)=> this.setState({
                DWMinuteInput: e.target.value,
              })}
            ></input>
          </div>
          <label htmlFor="progress">Daily Progress</label>
          <textarea
            id="progress"
            className="progress_input"
            placeholder=": DAILY-PROGRESS-1"
            onChange={(e)=> this.setState({
              dailyProgressInput: e.target.value
            })}
          >
          </textarea>

          <button
            className="submit-button"
            onClick={this.addDailyCommitment}
          >
            Add
          </button>


          {/* <button
            className="delete-button"
            onClick={this.deleteCommitments}
          >
            Delete
          </button> */}

          <div className="result">
            {this.state.recordResult}
          </div>
          <a href="https://console.firebase.google.com/project/commitment-record/firestore/data~2Fcommitment-record~2F2021-01-10">Firestore</a>

        </div>    

       </div>      
    )
  }
}
