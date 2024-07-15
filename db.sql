create database movie_database;

use movie_database;

create table production_company (
    p_id varchar(36),
    name varchar(50) not null,
    city varchar(50) not null,
    country varchar(50) not null,
    primary key(p_id)
);
 
create table movie (
    m_id varchar(36),
    title varchar(100) not null,
    release_yr int(4) not null,
    plot_outline text not null,
    length int not null,
    p_id varchar(36) not null,
    primary key(m_id),
    foreign key(p_id) references production_company(p_id) on delete cascade
);
 
create table genre (
    m_id varchar(36) not null,
    genre varchar(20) not null,
    foreign key(m_id) references movie(m_id) on delete cascade
);
 
create table actor (
    act_id varchar(36),
    primary key(act_id)
);
 
create table appears (
    act_id varchar(36),
    m_id varchar(36),
    role varchar(25),
    primary key(m_id, act_id),
    foreign key(m_id) references movie(m_id) on delete cascade,
    foreign key(act_id) references actor(act_id) on delete cascade
);
 
create table only_actor (
    a_id varchar(36),
    fname varchar(25) not null,
    lname varchar(25) not null,
    dob date not null,
    act_id varchar(36) not null,
    primary key(a_id),
    foreign key(act_id) references actor(act_id) on delete cascade
);
 
create table director (
    d_id varchar(36),
    fname varchar(25) not null,
    lname varchar(25) not null,
    dob date not null,
    act_id varchar(36),
    primary key(d_id),
    foreign key(act_id) references actor(act_id) on delete cascade
);
 
create table directs (
    m_id varchar(36),
    d_id varchar(36),
    primary key(m_id, d_id),
    foreign key(m_id) references movie(m_id) on delete cascade,
    foreign key(d_id) references director(d_id) on delete cascade
);
 
create table speaks_quote (
    m_id varchar(36),
    act_id varchar(36),
    quote text not null,
    primary key(m_id, act_id),
    foreign key(m_id) references movie(m_id) on delete cascade,
    foreign key(act_id) references actor(act_id) on delete cascade
);