import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    stream:{type:mongoose.Schema.Types.ObjectId,ref:"Stream",required:true},
    code:{type:Number,required:true},
    name:{type:String,required:true},
    type:{type:String, required:true,
        validate:{
            validator: function(value){
                return ['theory', 'lab'].includes(value.toLowerCase());
            },
            message: props => `${props.value} is not a valid type. Allowed: theory or lab.`
        },
        set: v=>v.toLowerCase()
    },
    credits:{type:Number,default:0},
    totalClassesPerWeek:{
        type:Number,
        default:function(){
            if(!this.type) return 0;
            return (this.type=='theory')? this.credits : this.credits*2;
        }
    }
},
{timestamps:true})

const Subject = mongoose.model('Subject',subjectSchema);
export default Subject;