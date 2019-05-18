import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as RxOp from 'rxjs/operators';

export interface User {
  id?: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private userDoc: AngularFirestoreDocument<User>;

  public usersList$: Observable<any[]>;
  public newUser: User;
  public editUser: User;

  private usersCollection: AngularFirestoreCollection<User>;

  constructor(private afs: AngularFirestore) {
    this.newUser = this.getEmptyUser();

    this.usersCollection = afs.collection('users');
    // this.usersList$ = this.usersCollection.valueChanges();
    this.usersList$ = this.usersCollection.snapshotChanges().pipe(
      RxOp.map(actions => actions.map(a => {
        const data = a.payload.doc.data() as User;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  public getEmptyUser = (): User => {
    return {
      username: null,
      email: null,
      first_name: null,
      last_name: null,
    };
  }

  public addNewUser = () => {
    this.usersCollection.add(this.newUser);
    this.newUser = this.getEmptyUser();
  }

  public deleteUser = (user: User) => {
    this.userDoc = this.afs.doc<User>('users/' + user.id);
    this.userDoc.delete();

    // If the user is loaded in the form, remove it
    if (user.id === this.editUser.id) { this.editUser = null; }
  }

  public loadUser = (user: User) => {
    this.userDoc = this.afs.doc<User>('users/' + user.id);

    // public item: Observable<User>;
    // this.user$ = this.userDoc.valueChanges();
    const subs = this.userDoc.snapshotChanges().subscribe(state => {
      this.editUser = state.payload.data();
      this.editUser.id = state.payload.id;
      subs.unsubscribe(); // Just take the value once
    });
  }

  public saveUser = () => {
    this.userDoc.update(this.editUser);
  }


}
