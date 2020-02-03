FROM ubuntu:16.04

WORKDIR ~/

RUN apt update -y
RUN apt upgrade -y

RUN apt install curl -y
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt install nodejs -y

RUN apt install git -y

RUN apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys B97B0AFCAA1A47F044F244A07FCC7D46ACCC4CF8
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ precise-pgdg main" > /etc/apt/sources.list.d/pgdg.list
RUN apt update && apt install -y python-software-properties software-properties-common postgresql-9.3 postgresql-client-9.3 postgresql-contrib-9.3
USER postgres
RUN    /etc/init.d/postgresql start &&\
    psql --command "CREATE USER docker WITH SUPERUSER PASSWORD 'docker';" &&\
    createdb -O docker scratch
	
USER root
RUN git clone https://github.com/tienanh2007/scratchio
WORKDIR scratchio

RUN npm install
RUN service postgresql stop && service postgresql start
EXPOSE 5432
EXPOSE 3000



CMD ["npm", "start"]