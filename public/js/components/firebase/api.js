/*
	 public method to init firebase app,
	 and get a firebase instance with our config */
const initFirebaseApp = (config, callback) => {
	if (!window.firebase) {
		createFirebaseScript(config, callback)
	} else {
		return callback
	}
}

/* insert firebase script and give callback to onload */
const createFirebaseScript = (config, callback) => {
	const firebaseScript = document.createElement('script')
	firebaseScript.src = 'https://www.gstatic.com/firebasejs/7.14.2/firebase-app.js'
	firebaseScript.async = true
	firebaseScript.onload = () => {
		const firebaseApp = firebase.initializeApp(config)
		createFirebaseAuthScript(() => {
			createFirestoreScript(() => {
				createFirebaseFunctionsScript(() => {
					callback(firebaseApp)
				})
			})
		})
	}
	document.body.appendChild(firebaseScript)
}

/* we also need firebase auth, give it the callback,
	 for when it is ready */
const createFirebaseAuthScript = (callback) => {
	const firebaseAuthScript = document.createElement('script')
	firebaseAuthScript.src = 'https://www.gstatic.com/firebasejs/7.14.2/firebase-auth.js'
	firebaseAuthScript.async = true
	firebaseAuthScript.onload = () => {
		callback()
	}
	document.body.appendChild(firebaseAuthScript)
}

/* we also need firestore, give it the callback,
	 for when it is ready */
const createFirestoreScript = (callback) => {
	const firestoreScript = document.createElement('script')
	firestoreScript.src = 'https://www.gstatic.com/firebasejs/7.14.2/firebase-firestore.js'
	firestoreScript.async = true
	firestoreScript.onload = () => callback()
	document.body.appendChild(firestoreScript)
}

const createFirebaseFunctionsScript = (callback) => {
	const firebaseFunctionsScript = document.createElement('script')
	firebaseFunctionsScript.src = 'https://www.gstatic.com/firebasejs/7.14.2/firebase-functions.js'
	firebaseFunctionsScript.async = true
	firebaseFunctionsScript.onload = () => callback()
	document.body.appendChild(firebaseFunctionsScript)
}

/* firebase auth, user things */
const loginUser = (firebaseInstance, email, password) => {
	return firebaseInstance
				 .auth()
				 .signInWithEmailAndPassword(email, password)
}

const registerUser = (firebaseInstance, email, password) => {
	return firebaseInstance
		.auth()
		.createUserWithEmailAndPassword(email, password)
}

const deleteUser = (firebaseInstance) => {
	const user = firebaseInstance.auth().currentUser
	return user.delete()
}

const updateUserEmail = (firebaseInstance, email) => {
	return firebaseInstance
		.auth()
		.currentUser
		.updateEmail(email)
}

function sendPasswordResetEmail(firebaseInstance, email) {
	return firebaseInstance
		.auth()
		.sendPasswordResetEmail(email);
}
function sendVerificationEmail(firebaseInstance) {
	const user = firebaseInstance.auth().currentUser
	return user.sendEmailVerification()
}

/* Communication with firebase's firestore, data api */
const createJob = (firebase, job, user) => {
	const {
		title,
		url,
		body
	} = job

	const newModelRef = firebase.firestore().collection('jobs')

	return newModelRef.add({
		user,
		url,
		title,
		body,
		isApproved: false
	}).then(serializePostResponse)
}

const serializePostResponse = async (res) => {
	const data = await res.get()
	/* here we have data.id available */
	return data
}

const editJob = (firebase, job) => {
	const {
		id,
		title,
		body,
		url
	} = job

	if (!id) return false
	return firebase.firestore()
								 .collection('jobs').doc(id)
								 .update({
									 title,
									 body,
									 url
								 }).then(data => {
									 return data
								 }).catch(error => {
									 console.log('job edit error', error)
								 })
}

const deleteJob = (firebase, id) => {
	if (!id) return false
	return firebase.firestore()
								 .collection('jobs').doc(id)
								 .delete()
}

const publishJob = (firebase, id, token, coupon) => {
	const publish = firebase.functions().httpsCallable('publishJob')
	return publish({ id, token, coupon }).then(res => res.data)
}

const unpublishJob = (firebase, id) => {
	return firebase
		.firestore()
		.collection('jobs').doc(id)
		.update({
			publishedAt: 0
		})
}

const getJob = async (firebaseInstance, jobId) => {
	const defaultFirestore = firebaseInstance.firestore()
	const docRef = await defaultFirestore.collection('jobs').doc(jobId)

	let doc
	try {
		doc = await docRef.get()
	} catch (error) {
		console.log('error fetching job')
	}

	let job = {}
	if (doc && doc.exists) {
		job = serializeJobDoc(doc, firebaseInstance)
	}

	return job
}

const onJob = async (firebaseInstance, jobId, callback) => {
	if (!jobId) return callback({})

	const defaultFirestore = firebaseInstance.firestore()
	const docRef = await defaultFirestore.collection('jobs').doc(jobId)
	await docRef.onSnapshot(doc => {
		let job = {}
		if (doc && doc.exists) {
			job = serializeJobDoc(doc, firebaseInstance)
		}
		return callback(job)
	})
}

const getLatestJobs = (firebaseInstance, tag = '') => {
	const defaultFirestore = firebaseInstance.firestore()

	const today = new Date()
	const priorDate = new Date().setDate(today.getDate() - 31)

	return defaultFirestore
		.collection('jobs')
		.where('publishedAt', '>', new Date(priorDate))
		.where('tags', 'array-contains', tag.toLowerCase())
		.orderBy('publishedAt')
		.get()
		.then(querySnapshot => {
			return serializeJobsCollection(querySnapshot, defaultFirestore)
		})
}

const getUserJobs = (firebaseInstance, userId) => {
	const defaultFirestore = firebaseInstance.firestore()

	return defaultFirestore
		.collection('jobs')
		.where('user', '==', userId)
		.get()
		.then(function(querySnapshot) {
			let data = []
      querySnapshot.forEach(function(doc) {
				return data.push(serializeJobDoc(doc, defaultFirestore))
      })
			return data
    }).catch(function(error) {
			console.log('Error getting document:', error)
		})
}

const serializeJobsCollection = (snapshot, firebaseInstance) => {
	let sRes = []
	snapshot.forEach(item => {
		sRes.push(serializeJobDoc(item, firebaseInstance))
	})
	return sRes
}

const serializeJobDoc = (jobDoc, firebaseInstance) => {
	let job = jobDoc.data()
	job.id = jobDoc.id

	let user
	if (firebaseInstance
			&& typeof firebaseInstance.auth === 'function'
	) {
		let currentUser = firebaseInstance.auth().currentUser
		if (currentUser) {
			user = currentUser.uid
		}
	}

	if (user && job.user === user) {
		job.isOwner = true
	}

	if (job.body && job.body.length > 150) {
		job.bodyTruncated = job.body.slice(0, 150) + '...'
	} else {
		job.bodyTruncated = job.body
	}

	const today = new Date()
	const priorDate = new Date().setDate(today.getDate() - 31)
	const publishDate = job.publishedAt
	if (today - priorDate < publishDate) {
		job.isPublished = true
	}
	return job
}

/* What we can use from outside this file */
export {
	initFirebaseApp,
	loginUser,
	registerUser,
	deleteUser,
	updateUserEmail,
	sendPasswordResetEmail,
	sendVerificationEmail,
	getLatestJobs,
	getUserJobs,
	getJob,
	onJob,
	editJob,
	createJob,
	deleteJob,
	publishJob,
	unpublishJob
}
