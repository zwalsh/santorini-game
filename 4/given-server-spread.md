[Okay, this is NOT pdf]


```
---------------------------------------------------------------------------------------------------
     spreadsheet server                                      +------- accountant starts
			      ||                             |            | 
	     |                ||          spread client <----+            |
	     |                ||            |                             |
	     |<-----------------------------| tcp connect                 |
	     |                ||            |                             |
	     |                ||            |<----------------------------| named spreadsheet
	     |                ||            |<----------------------------| set requests 
	     |                ||            |<----------------------------| named spreadsheet
	     |                ||            |<----------------------------| set requests 
	     |                ||            |                             | ...
	     |                ||            |<----------------------------| at request 
	     |                ||            |                             |
	     |<~~~~~~~~~~~~~~~~~~~~~~~~~~~~~| send batch 		  |
	     |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~>| receive at response	  | 
	     |                ||            |---------------------------->| print at response 
	     |                ||            |                             | 
	     |                ||            |<----------------------------| named spreadsheet
	     |                ||            |<----------------------------| set requests 
	     |                ||            |<----------------------------| named spreadsheet
	     |                ||            |<----------------------------| set requests 
	     |                ||            |                             | ...
	     |                ||            |<----------------------------| at request 
	     |<~~~~~~~~~~~~~~~~~~~~~~~~~~~~~| send batch 		  |
	     |                ||            |                             | 

```

The message formats are as follows: 
	     
|  message		  |  format						 |
| ----------------------- | ---------------------------------------------------- |
| batch                   | [named-spreadsheet+, set-request*, at-request]       |
| 	       	    	  |  			 	       			 |
| 	       	    	  |  			 	       			 |
| at response             | ["at", string, number, number, number]		 |
| 	       	    	  |  where string is the name of the probed spreadsheet  |
| 	       	    	  |        the first number is the x coordinate		 |
| 	       	    	  |        the second number is the y coordinate	 |
| 	       	    	  |        the third number is the value at that cell 	 |

All JSON values are well-formed and valid. See [
