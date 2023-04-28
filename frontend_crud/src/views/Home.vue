<template>
  <v-app id="inspire">
    <v-app-bar
      app
      color="#2c3a47"
      dark>
      <v-app-bar-nav-icon @click.stop="mini = !mini"/>
      <v-toolbar-title
        style="width: 300px"
        class="ml-0 pl-4">
        <span  class="hidden-sm-and-down">Mevn Stack</span>
      </v-toolbar-title>
      <v-spacer/>
      <v-btn icon>
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container
        class="scroll-y"
        fluid>
        <v-row
          align="center"
          justify="center">
          <v-col cols="8" md="8">
            <v-card class="ml-5 mr-5">
              <v-app-bar
                dark
                color="#2c3a47">
                <v-btn icon>
                  <v-icon>local_offer</v-icon>
                </v-btn>
                <v-toolbar-title>Posts</v-toolbar-title>
                <v-spacer/>
                <v-dialog v-model="dialog" persistent max-width="800px">
                  <template v-slot:activator="{on}">
                    <v-btn color="red" v-on="on" outlined>
                      <v-icon left>add</v-icon>Add
                    </v-btn>
                  </template>
                  <v-card>
                    <v-form @submit.prevent="savePost" ref="postData" lazy-validation enctype="multipart/form-data" aria-autocomplete="off">
                      <v-card-title>
                        <span class="headline">Posts</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container grid-list-md>
                          <v-layout wrap>
                            <v-flex xs12 sm12 md12>
                              <v-text-field label="Name"
                                            v-model="postData.name"
                                            color="#2c3a47">
                              </v-text-field>
                            </v-flex>
                            <v-flex xs12 sm12 md12>
                              <v-text-field label="Description"
                                            v-model="postData.description"
                                            color="#2c3a47">
                              </v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer/>
                        <v-btn
                            color="#3c3a47"
                            dark
                            @click="close"
                            outlined
                            small>
                          <v-icon left>exit_to_app</v-icon>Close
                        </v-btn>
                        <v-btn color="light-green darken-4" dark type="submit" outlined small>
                          <v-icon left>save</v-icon>
                          {{ saveDialog }}
                        </v-btn>
                      </v-card-actions>
                    </v-form>
                  </v-card>
                </v-dialog>
              </v-app-bar>
              <v-container>
                <v-card class="mx-auto elevation-19">
                  <v-card-title>
                    <v-spacer/>
                    <v-text-field
                    v-model="search"
                    append-icon="search"
                    label="Search"
                    Single-line
                    hide-details
                    color="#2c3a47">
                    </v-text-field>
                  </v-card-title>
                  <v-data-table
                      item-key="id"
                      :headers="headers"
                      :items="dataList"
                      :search="search">
                    <template v-slot:item.actions="{item}">
                      <v-btn
                          color="success"
                          class="mx-2"
                          fab
                          x-small
                          @click="editPost(item)"
                          outlined>
                        <v-icon small>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                          color="pink"
                          fab
                          x-small
                          outlined
                          @click.prevent="deletePost(item._id)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:no-results>
                      <v-alert :value="true" color="pink" icon="warning" dark>
                        Your Search {{search}} does exits
                      </v-alert>
                    </template>
                  </v-data-table>
                </v-card>
              </v-container>
            </v-card>
            <v-snackbar
            v-model="snackbar"
            top
            right
            :color="color">
              {{text}}
              <v-btn
                color="black"
                text
                @click="snackbar = false">
                Confirm
              </v-btn>
            </v-snackbar>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-btn
    v-scroll="onScroll"
    color="red"
    dark
    fab
    fixedright
    @click="toTop">
      <v-icon>mdi-chevron-up</v-icon>

    </v-btn>
  </v-app>
</template>

<script>
import axios from 'axios'
import Swal from 'vue-sweetalert2'

export default {
  props:{
    source:String
  },
  data:()=>({
    posts:[],
    headers:[
      {text: 'Name',value: 'name',sortable: true},
      {text: 'Description',value: 'description',sortable: true},
      {text: 'Action',value: 'actions', sortable: true}

    ],
    fab:false,
    search:'',
    snackbar:'',
    text:'',
    color:'',
    dataList:[],
    mini:false,
    dialog:false,
    postData:{
      name:'',
      description:''
    },
    default:{
      name:'',
      description:''
    },
    editedIndex:{
    },
  }),
  watch:{
    dialog(val){
      val || this.close()
    }
  },
  computed:{
    saveDialog(){
      return this.editedIndex === -1 ? 'Save' : 'Edit'
    }
  },
  mounted() {
    this.loadPosts()
  },
  methods:{
    loadPosts:async function(){
      const apiURL = 'http://localhost:3000/api'
      axios.get(apiURL)
          .then(res =>{
            this.dataList = res.data
          }).catch(err =>{
        console.log(err)
      })
    },
    onScroll(e){
      if(typeof window === 'undefined')return
      const top = window.pageYOffset || e.target.scrollTop || 0
      this.fab = top > 20
    },
    toTop(){
      this.$vuetify.goTo(0)
    },
    close(){
      this.dialog = false
      setTimeout(() =>{
        this.postData = Object.assign({},this.default)
        this.editedIndex = -1
      },300)
    },
    savePost:async function(){
      if(this.editedIndex > -1){
        this.updateData()
      }else{
        this.createPost()
      }
    },
    createPost(){
      let apiUrl = 'http://localhost:3000/api/create'
      axios.post(apiUrl,this.postData)
          .then(res=>{
            this.postData={
              name:'',
              description:''
            }
            this.close()
            this.color = 'success'
            this.text = 'Post has been successfully added'
            this.snackbar = true
            this.dataList.push(res.data)
          }).catch(err =>{
        console.log(err)
      })
    },
    editPost(item){
      console.log(item)
      this.editedIndex = this.posts.indexOf(item)
      this.postData = Object.assign({},item)
      this.dialog = true
    },
    updateData(){
      const apiURL = `http://localhost:3000/api/update/${this.postData._id}`
      axios.put(apiURL,this.postData)
          .then((res)=>{
            console.log(res)
            this.close()
            this.loadPosts()
            this.color = 'info'
            this.text = 'Success updated data'
            this.snackbar = true
          }).catch(err =>{
        console.log(err)
        console.log(this.$route.params.id)
      })
      },
    deletePost(id){
      this.$swal({
        title: 'Are you sure?',
        text: "You will not be able to go back",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#00b894',
        cancelButtonColor: '#d63031',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.isConfirmed) {
          try {
            let apiURL = `http://localhost:3000/api/delete/${id}`;
            let indexOfArrayItem = this.dataList.findIndex(i => i._id === id);
            axios.delete(apiURL).then(() => {
              this.dataList.splice(indexOfArrayItem, 1);
            }).catch(error => {
              console.log(error)
            });
            this.$swal(
                'Deleted!',
                'Post has been deleted.',
                'success'
            )
            //Notification error
            this.color = 'error'
            this.text = "Post has been deleted."
            this.snackbar = true;
            //Notification error
          }catch (error) {
            this.$swal("Failed!", "There was something wrong.", "warning");
          }
        }
      })

    },

    // deletePost(id){
    //   let apiURL = `http://localhost:3000/api/delete/${id}`;
    //   let indexOfArrayItem = this.posts.findIndex(i => i._id === id);
    //   this.$swal({
    //     title: 'Are you sur?',
    //     text: "You will not be able to go back",
    //     icon: 'warning',
    //     showCancelButton: true,
    //     confirmButtonColor: '#00b894',
    //     cancelButtonColor: '#d63031',
    //     confirmButtonText: 'Yes',
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       axios.delete(apiURL).then(() => {
    //         this.posts.splice(indexOfArrayItem, 1)
    //         this.$swal(
    //             'Deleted!',
    //             'The student has been deleted.',
    //             'success'
    //         )
    //       }).catch(error => {
    //         console.log(error)
    //       })
    //     }
    //   })
    //   }
    }
}
</script>
