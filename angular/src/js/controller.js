/**
 * Created by coreyou on 2014/12/20.
 */
(function() {   // closure is a good habit
    var app = angular.module('appName', ['memberTab-directives']); // [] 是 Dependencies of other modules, 這裡連結到directives.js

    app.controller('PersonCtrl', function(){    // PersonCtrl is controller's Name
        this.members = members;
    });

    // 可與 app.directive("memberTabs"替換
    app.controller('TabController', function(){ // used in tabInitClick.html
        this.tab = 1;

        // when tab is clicked, set the value of tab.
        this.setTab = function(newValue){
            this.tab = newValue;
        };

        // check the value of tab, return true or false.
        // combine with ng-show to show the content of tab.
        this.isSet = function(tabName){
            return this.tab === tabName;
        };
    });

    app.controller('ArticleController', function() {    // used in submit.html
        this.article = {};
        this.stars = [
            {
                score: 5,
                level: 'excellent'
            },
            {
                score: 4,
                level: 'fine'
            },
            {
                score: 3,
                level: 'normal'
            },
            {
                score: 2,
                level: 'ok'
            },
            {
                score: 1,
                level: 'bad'
            }
        ];
        this.article.createdDate = Date.now();

        this.addArticle = function (member) {
            member.articles.push(this.article);
            this.article = {};  // 清空 form 中的各欄位
        }
    });

    var members = [
        {
            name: 'coreyou',
            age: 18,
            deposit: 10000,
            isAuthorized: true,
            isDeprecatedMember: false,
            images: [
                'WebContent/images/finnJackHome.jpg',
                'WebContent/images/finnFace.png',
                'WebContent/images/WebContent/images/jackFace.png'
            ],
            articles: [
                {
                    stars: 5,
                    body: "I am very cool!",
                    author: "corey_ou@abc.com"
                },
                {
                    stars: 3,
                    body: "I am very handsome!",
                    author: "corey_ou@abc.com"
                }
            ]
        },
        {
            name: 'Peter',
            age: 30,
            deposit: 500000,
            isAuthorized: false,
            isDeprecatedMember: false,
            images: [
                'WebContent/images/finnFace.png',
                'WebContent/images/jackFace.png'
            ],
            articles: [
                {
                    stars: 5,
                    body: "I am very cool!",
                    author: "peter_cc@abc.com"
                },
                {
                    stars: 3,
                    body: "I am very handsome!",
                    author: "peter_cc@abc.com"
                },
                {
                    stars: 3,
                    body: "I am very 呵呵!",
                    author: "peter_cc@abc.com"
                }
            ]
        },
        {
            name: 'John',
            age: 25,
            deposit: 700000,
            isAuthorized: false,
            isDeprecatedMember: true,
            images: [
                'WebContent/images/finnFace.png',
                'WebContent/images/jackFace.png'
            ],
            articles: [
                {
                    stars: 1,
                    body: "I am john!",
                    author: "john@abc.com"
                },
                {
                    stars: 2,
                    body: "I am not john!",
                    author: "john@abc.com"
                },
                {
                    stars: 3,
                    body: "I am john and not!",
                    author: "john@abc.com"
                }
            ]
        },
        {
            name: 'Kevin',
            age: 37,
            deposit: 555000,
            isAuthorized: true,
            isDeprecatedMember: false,
            images: [
                'WebContent/images/finnFace.png',
                'WebContent/images/jackFace.png'
            ],
            articles: [
                {
                    stars: 4,
                    body: "I am kevin!",
                    author: "kevin@abc.com"
                },
                {
                    stars: 5,
                    body: "I am not kevin!",
                    author: "kevin@abc.com"
                },
                {
                    stars: 3,
                    body: "I am kevin and not!",
                    author: "kevin@abc.com"
                }
            ]
        },
        {
            name: 'frank',
            age: 19,
            deposit: 1567890,
            isAuthorized: true,
            isDeprecatedMember: false,
            images: [
                'WebContent/images/finnFace.png',
                'WebContent/images/jackFace.png'
            ],
            articles: [
                {
                    stars: 4,
                    body: "I am frank!",
                    author: "frank@abc.com"
                },
                {
                    stars: 5,
                    body: "I am not frank!",
                    author: "frank@abc.com"
                },
                {
                    stars: 3,
                    body: "I am frank and not!",
                    author: "frank@abc.com"
                }
            ]
        }
    ];

})();