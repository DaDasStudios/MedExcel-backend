# MedExcel ⚕️
MedExcel is a brand new website that allows medical students to improve thier knowledge about different areas of medicine. This application gives a bunch of exams with high quality questions that only medicine studets could answer. Alse, the exams are created by real medicine teachers and professionals, so they can guarantee a good level of learning.

## REST API documentation
This project just includes the routes that client can use at front-end to perform the operations required by the manager. Since the website needs to be accessible and secure, most of the routes needs authentication and a role for authorization.

---

# Getting started
You can ping the server sending a *GET* request to `/ping`, then you'll receive a pong as response.

## Sign up & sign in

Send a **POST** request to `/auth/signup` to create a new account in order to get started, you'll need to pass some data in the body.

All the parameters below are required.
```ts
{
    // more than 5 characters
    "username": string // John Doe

    "email": string // john.doe@gmail.com

    // more than 8 characters
    "password": string // pleasedonthackme
}
```

Server needs an email confirmation, so you'll need to go to the provided email address and check out you inbox.

```json
{
    "message": "Waiting for email confirmation"
}
```

Once you've clicked over the link, you'll be authenticated so you can access to most of the application routes, then you'll be redirected to the application signin webpage.

Now, you'll need to **sign in**, so you can send a **POST** request to `/auth/signin` and pass the following body schema:

```ts
{
    "email": string, // The email address specified when signing up
    "password": string 
}
```

If everything was right, there must be a _**token**_ and your user in **ID** in the response's body

```json
{
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZDdjZWY5ZGViMGIzZDcyZTQ1ZWU3NSIsImlhdCI6MTY3NTA4NzYzOSwiZXhwIjoxNjc1MTc0MDM5fQ.jENPUOeHkpg_LD_UNnGjUBT59whZVv0nOcJW21ySjhN",
	"id": "62d7ced2deb0b3d72e45ee35"
}
```

So now you can get authenticated in the application with the token, and get your own information using the ID.

---

## Own information and roles
You'd probably want to see your data, there's a route that handles this part: `/users/...` At this route, you can access users' information depending on your role. By default, each created user has a *User* role, which just leaves you handle your own information. How ever, there's the *Admin* role, which has more access around the platform.

At `/users/user/owner/{id}` only the owner user can access to data, neiter the administrator. You just need to pass the same ID as the yours one and being authenticated.

* __GET__ to request user's information.
* __PUT__ to update username.

Also, don't forget yo pass the `Authorization` header in the request:
```json
"headers": {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZDdjZWY5ZGViMGIzZDcyZTQ1ZWU3NSIsImlhdCI6MTY3NTA4NzYzOiZXhwIjoxNjc1MTc0MDM5fQjENPUOeHkpg_LD_UNnGjUBT59whZVv0nOcJW21ySjN"
}
```

## Recover password
In case you forgot your password, there's still a chance to recover your account.  

Visit **PUT** `/users/password` and pass the email of the forgotten account in the request body. As when you signed up, you'd probably must received an email confirmation, don't forget to check your spam section if nothing has come in.

When you click on the link, you'll be redirected to the client application with a unique token that you need to send to recover your password. Now try to sign in again with the new password, and see it all works!

How ever, if you want to do it all from a custom client. You can find a token in the link of the mail, use that token to request **PUT** to `/users/password/{recoverToken}` and pass `newPassword` in the body.

> You only can change your password once!

---

## Admin abilities
As you can imagine, Admin roles is a super user that can access to more information than normal users. So here you can find what information admin can access.

### Users' data
Admin can query this information at `/users/{id}`.

* __GET__ See user's information.
* __PUT__ Update user's username.
* __DELETE__ Remove a registered user from the database (this can be useful when a user breaks the terms & conditions. Also, if an user wants to delete their account, they can send an email, so admin can delete their account).

> There're others abilities that admin, you can find them in the next section.

---

# Site settings
Since this REST API is for a client-side application, there's some settings that only admin can change, but they're of public access to everyone around the internet.

## Get the site information
You can see the site information (such as logo and subscription plans) by visiting to **GET** `/site/` then you will see something like below.

```json
{
	"name": "Medexcel",
	"image": {
		"url": "http://res.cloudinary.com/dpszq2uod/image/upload/v1674761863/MedExcel/medexcel-logo.png"
	},
	"subscriptionPlans": [
		{
			"name": "Basic",
			"description": "1 month access for £5",
			"price": 5,
			"days": 30,
			"createdAt": "2023-01-28T20:19:58.580Z",
			"updatedAt": "2023-01-28T20:19:58.580Z",
			"_id": "63d5836e5aeef3abbd12cd20"
		},
		{
			"name": "Full",
			"description": "Year access for £30",
			"price": 30,
			"days": 365,
			"createdAt": "2023-01-28T20:20:45.768Z",
			"updatedAt": "2023-01-28T20:20:45.768Z",
			"_id": "63d5839d5aeef3abbd12cd25"
		},
		{
			"name": "Half year",
			"description": "6 month for £20",
			"price": 20,
			"days": 182,
			"createdAt": "2023-01-28T20:21:51.136Z",
			"updatedAt": "2023-01-28T20:21:51.136Z",
			"_id": "63d583df5aeef3abbd12cd2a"
		}
	]
}
```

---

### Website logo
The server has the ability to save attachments and images, so the admin can send **PUT** to `/site/image` with body enctype `multipart/form-data` to perform the upload of images. This route is *PUT* because the image will be updated or created automatically.

> The image size cannot be bigger than 500Kb and cannot be other file like text files. 

--- 

### Subscription plans
Admin can add new subscriptions plans that will be shown when users visit the front-end page. This subscription plans allow user to access to exams the period of time specified by the admin at when creating them. 

To add a new plan, admin will **POST** to `/site/subscription/` and send a body like the following:

```ts
{
    "name": string,
    "description": string,
    "days": number,
    "price": number,
}
```

Then the plan will be pushed to the list of plans and anyone can see it by querying **GET** `/site/`.

Aditionally, admin can modify and delete subscriptions plans at the same URL with an ID passed in the body.

* __PUT__ Update any existing property of the subscription plan.
* __DELETE__ Delete the whole subscription plan.

> If you want to see only the subscription plans, you can **GET** `/site/subscriptions/`

---

# Questions
The exams contain questions that user can choose to answer later, so admin needs to be able to create new questions. Visiting `/question/` admin can take all this actions.

> User can take an overview of the questions requesting **GET** `/question/` but not either content or answers will show up.

## Requesting existing questions
Admin can visit **POST** `/question/filter` and pass some parameters in order to filter the questions. Here's an example of it:

```ts
{
    "id": string, // If ID is provided, the remaining parameters will be ignored
    "category": string[],
    "type": string[],

    // category and type can be passed separately
}
```

> If admin wants to get all question including their answers `category` must be an empty array and `type` shouldn't be passed.

## Creating a new question
There're three types of questions that can be created:

* Standard Single Best Answer (SBA).
* Extended Choice Question (ECQ).
* Case Based Questions (CBQ).

These types of questions are very different, so the server needs to handle them according to their type. Also, the data has to be ordered properly. See the question schema:

```ts
interface IQuestion<T> {
    _id: string
    type: string
    scenario: string
    content: T
    category: string
    subcategory?: string
}
```

No matter what type of question is, it must have the above attributes. What actually changes is the `content` attribute, which can take different types:

```ts
type CBQQuestion = SBAQuestion[]

interface ECQQuestion {
    options: string[]
    questions: Array<{
        question: string
        answer: string | number
        explanation: string
    }>

}

interface SBAQuestion {
    options: string[]
    question: string
    answer: number
    explanation: string
}
```

So that, the admin is free to pass a pass different content in the body of the request which has to be the specified as above.

### Other actions
Admin can also update and delete created questions by passing the ID in the URL as follows **PUT/DELETE** `/question/{id}`

---

# Payments
Users has a free trial period for two weeks, how ever after that period of time, user may want to buy a subscription. Here you can find how it actually works using Paypal as a payment method.

> Admin can set a custom day duration of a selected user via **PUT** `/users/user/subscription/:id` and pass `days` in the request body.

## Buying a subscription plan
Before actually buy a subscription, user needs to specify which subscription plan wants to pay. So client will request **POST** to `/payments/create-order/{id}` where `id` is the subscription plan identifier needed.

This will create a CAPTURE intent to Paypal for the found subscription with the ID provided. Then, the server will respond with a set of links to visit and continue with the payment process.

```json
{
	"message": "Order created",
	"order": {
		"status": "CREATED",
		"links": [
			{
				"href": "...",
				"rel": "self",
				"method": "GET"
			},
			{
				"href": "...",
				"rel": "approve",
				"method": "GET"
			},
			{
				"href": "...",
				"rel": "update",
				"method": "PATCH"
			},
			{
				"href": "...",
				"rel": "capture",
				"method": "POST"
			}
		]
	}
}
```

Since user want to buy a plan, client-side application's going to need to visit the second link which has `rel: approve`. Once clicked the `href` property, you're gonna be redirected to the paypal endpoint, so you'll take actions there.

In case the payment is approved, paypal will go to **GET** `/payments/capture` to capture the order and set the subscription plan to the user for the period of time specified. And if the capture intent is cancelled, nothing relevant will happen.

--- 

# Starting an exam
When user want to start an exam, they're going to need to request **POST** `/exam/set` and pass some filters in the body.

```ts
{
    categories: string[],
    filter: "NEW" | "ALL" | "INCORRECT"
}
```

The weird parameter here is `filter`, but is very important. This parameter allows user to choose between tha last-added questions (for `NEW`), all the questions that match with the categories (for `ALL`), and only the questions that user hasn't answered correctly yet (for `INCORRECT`). Notice that `categories` and `filter` can be used at the same time.

This route responds with the list of IDs with the questions that user has to answer.

```json

{
	"message": "Exam started",
	"questions": [
		"63d51b6a451661cf4d8a573b",
		"63d51bc99225b36589c4f190",
		"63d51c1e9225b36589c4f19a",
		"63d51c589225b36589c4f1a4"
	]
}
```

> 📏 Only users can start an exam, this route is not allowed to admin, because they have access to answers and main content. 

Once an exam is started, user won't be able to start another without cancelling the current one, so that can be done by requesting **DELETE** `/exam/cancel` and user can now start another exam.

> ⚠️ Answers matched as correct won't be removed from the list!

---

## Handleing user extra information
Everytime user takes an exam and sends answers requests, the user's exam information will change based on the answers. For instance, there's a field that stores the questions that were answered correctly. User can reset that record via **PUT** `/users/user/owner/reset-exam-history/:id` where the `id` is the user's ID. 

## Answer questions
User will keep a property in the database that indicates the current question to be answered. So the user needs to request **POST** `/exam/answer/` and pass body like the following:

```ts
{
    // For SBA
    answer: string

    // For the others
    answers: string[]
}
```

> ❕ The answers have to be sorted by the same order as the options in case of ECQ or CBQ.

---

### Get current question
If user want to know what question is in, just query to **GET** `/exam/current` and will return a response like this:

```json
{
	"question": {
		"_id": "63d51b6a451661cf4d8a573b",
		"type": "SBA",
		"category": "Medicine",
		"scenario": "...",
		"content": {
			"options": [
				"A",
				"B",
				"C"
			],
			"question": "Some question",
			"answer": null,
			"explanation": null
		},
		"createdAt": "2023-01-28T12:56:10.218Z",
		"updatedAt": "2023-01-28T12:56:10.218Z",
		"__v": 0
	}
}
```

---

### Conclusion

So that's basically all the REST API I built for this project. I can say that here I implemented a bunch of concepts very useful that I didn't know before, so this is so gratifying. Next, it's just create the admin panel and front-end application.








