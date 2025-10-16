
-- PostgreSQL database dump
--

\restrict rhr8yb2WdgoZv7BCBJOQsgmpaXOoatAIsc0mPHDlP4871eaflDCgcq9FVNtJrdx

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.salary_history DROP CONSTRAINT IF EXISTS salary_history_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.leaves DROP CONSTRAINT IF EXISTS leaves_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.leaves DROP CONSTRAINT IF EXISTS leaves_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS fk_department_manager;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS attendance_employee_id_fkey;
DROP INDEX IF EXISTS public.idx_leaves_status;
DROP INDEX IF EXISTS public.idx_leaves_employee_date;
DROP INDEX IF EXISTS public.idx_employees_manager;
DROP INDEX IF EXISTS public.idx_employees_department;
DROP INDEX IF EXISTS public.idx_attendance_employee_date;
DROP INDEX IF EXISTS public.idx_attendance_date;
ALTER TABLE IF EXISTS ONLY public.salary_history DROP CONSTRAINT IF EXISTS salary_history_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_title_key;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.leaves DROP CONSTRAINT IF EXISTS leaves_pkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_pkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_email_key;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS attendance_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS attendance_employee_id_date_key;
ALTER TABLE IF EXISTS public.salary_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.leaves ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employees ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.departments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.attendance ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.salary_history_id_seq;
DROP TABLE IF EXISTS public.salary_history;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP SEQUENCE IF EXISTS public.leaves_id_seq;
DROP TABLE IF EXISTS public.leaves;
DROP SEQUENCE IF EXISTS public.employees_id_seq;
DROP TABLE IF EXISTS public.employees;
DROP SEQUENCE IF EXISTS public.departments_id_seq;
DROP TABLE IF EXISTS public.departments;
DROP SEQUENCE IF EXISTS public.attendance_id_seq;
DROP TABLE IF EXISTS public.attendance;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: abhishekchaubey
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    employee_id integer,
    date date NOT NULL,
    check_in time without time zone,
    check_out time without time zone,
    hours_worked numeric(4,2),
    status character varying(20) DEFAULT 'present'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_attendance_status CHECK (((status)::text = ANY ((ARRAY['present'::character varying, 'absent'::character varying, 'late'::character varying, 'half_day'::character varying, 'leave'::character varying])::text[])))
);



--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: abhishekchaubey
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: abhishekchaubey
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: abhishekchaubey
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    location character varying(100),
    manager_id integer
);



--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: abhishekchaubey
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: abhishekchaubey
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: abhishekchaubey
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20),
    hire_date date NOT NULL,
    job_title character varying(100) NOT NULL,
    department_id integer,
    salary numeric(10,2),
    address text,
    city character varying(50),
    state character varying(50),
    postal_code character varying(20),
    country character varying(50),
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dob date,
    role_id integer,
    manager_id integer,
    is_active boolean DEFAULT true
);



--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: abhishekchaubey
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: abhishekchaubey
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: leaves; Type: TABLE; Schema: public; Owner: abhishekchaubey
--

CREATE TABLE public.leaves (
    id integer NOT NULL,
    employee_id integer,
    leave_type character varying(50) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text,
    status character varying(20) DEFAULT 'pending'::character varying,
    approved_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_leave_status CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))),
    CONSTRAINT valid_leave_type CHECK (((leave_type)::text = ANY ((ARRAY['sick'::character varying, 'casual'::character varying, 'vacation'::character varying, 'maternity'::character varying, 'paternity'::character varying])::text[])))
);



--
-- Name: leaves_id_seq; Type: SEQUENCE; Schema: public; Owner: abhishekchaubey
--

CREATE SEQUENCE public.leaves_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: leaves_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: abhishekchaubey
--

ALTER SEQUENCE public.leaves_id_seq OWNED BY public.leaves.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: abhishekchaubey
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    grade character varying(50),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: abhishekchaubey
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: abhishekchaubey
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: salary_history; Type: TABLE; Schema: public; Owner: abhishekchaubey
--

CREATE TABLE public.salary_history (
    id integer NOT NULL,
    employee_id integer,
    effective_date date NOT NULL,
    salary numeric(10,2) NOT NULL,
    note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: salary_history_id_seq; Type: SEQUENCE; Schema: public; Owner: abhishekchaubey
--

CREATE SEQUENCE public.salary_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: salary_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: abhishekchaubey
--

ALTER SEQUENCE public.salary_history_id_seq OWNED BY public.salary_history.id;


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: leaves id; Type: DEFAULT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.leaves ALTER COLUMN id SET DEFAULT nextval('public.leaves_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: salary_history id; Type: DEFAULT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.salary_history ALTER COLUMN id SET DEFAULT nextval('public.salary_history_id_seq'::regclass);


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: abhishekchaubey
--

COPY public.attendance (id, employee_id, date, check_in, check_out, hours_worked, status, notes, created_at) FROM stdin;
1	10	2025-10-16	20:37:00	20:37:00	0.00	present		2025-10-16 20:37:54.380077
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: abhishekchaubey
--

COPY public.departments (id, name, description, created_at, location, manager_id) FROM stdin;
1	Human Resources	Handles recruitment, employee relations, and HR operations	2025-10-14 09:53:12.345077	Floor 1	\N
2	Information Technology	Manages technology infrastructure and software development	2025-10-14 09:53:12.345077	Floor 2	\N
3	Finance	Handles accounting, budgeting, and financial operations	2025-10-14 09:53:12.345077	Floor 3	\N
4	Marketing	Responsible for marketing campaigns and brand management	2025-10-14 09:53:12.345077	Floor 4	\N
5	Operations	Manages daily business operations and logistics	2025-10-14 09:53:12.345077	Floor 1	\N
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: abhishekchaubey
--

COPY public.employees (id, first_name, last_name, email, phone, hire_date, job_title, department_id, salary, address, city, state, postal_code, country, status, created_at, updated_at, dob, role_id, manager_id, is_active) FROM stdin;
6	Test	User	test@company.com	123-456-7890	2024-01-01	Test Engineer	2	60000.00	\N	\N	\N	\N	\N	active	2025-10-14 14:52:57.761595	2025-10-14 14:52:57.761595	\N	\N	\N	t
9	Kushina	Uzumaki	kushinauzumaki@gmail.com	0987654321	2025-10-02	HR Manager	1	90000.00	\N	Delhi	Delhi	12345	India	active	2025-10-15 15:34:39.294283	2025-10-15 15:34:39.294283	\N	\N	\N	t
7	Minato	Namikaze	minatonamikaze@gmail.com	1234567890	2025-09-29	Software Engineer	2	90000.00	\N	Delhi	Delhi	1234	India	active	2025-10-14 15:32:35.962313	2025-10-14 15:32:35.962313	\N	\N	\N	t
3	Mike	Johnson	mike.johnson@company.com	+1-555-0103	2023-06-09	Financial Analyst	3	70000.00	789 Pine Rd	New York	NY	10003	USA	active	2025-10-14 09:53:12.345834	2025-10-14 09:53:12.345834	\N	\N	\N	t
5	David	Brown	david.brown@company.com	+1-555-0105	2023-02-25	DevOps Engineer	2	90000.00	654 Maple Dr	New York	NY	10005	USA	active	2025-10-14 09:53:12.345834	2025-10-14 09:53:12.345834	\N	\N	\N	t
10	Naruto	Uzumaki	narutouzumaki@gmail.com	1232312122	2025-10-15	Software Engineer	5	99999.98	\N	\N	\N	\N	\N	active	2025-10-16 10:13:45.588637	2025-10-16 10:13:45.588637	\N	\N	\N	t
4	Sarah	Wilson	sarah.wilson@company.com	+1-555-0104	2021-11-03	Marketing Director	4	80000.00	321 Elm St	New York	NY	10004	USA	on_leave	2025-10-14 09:53:12.345834	2025-10-16 10:20:54.674952	\N	\N	\N	t
11	Vaibhav	Jain	vaibhavjain@gmail.com	9434542801	2021-01-19	Software Engineer	2	120000.00	Sector-63, Street No-5	Noida	Uttar Pradesh	232102	India	inactive	2025-10-16 17:13:28.757127	2025-10-16 17:14:59.467484	\N	\N	\N	t
\.


--
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: abhishekchaubey
--

COPY public.leaves (id, employee_id, leave_type, start_date, end_date, reason, status, approved_by, created_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: abhishekchaubey
--

COPY public.roles (id, title, grade, description, created_at) FROM stdin;
1	HR Manager	L4	Manages HR department and operations	2025-10-16 20:31:35.886448
2	Software Engineer	L3	Develops and maintains software applications	2025-10-16 20:31:35.886448
3	Senior Software Engineer	L4	Leads technical projects and mentors junior engineers	2025-10-16 20:31:35.886448
4	Financial Analyst	L3	Analyzes financial data and prepares reports	2025-10-16 20:31:35.886448
5	Marketing Specialist	L3	Executes marketing campaigns and strategies	2025-10-16 20:31:35.886448
6	Operations Manager	L4	Oversees daily business operations	2025-10-16 20:31:35.886448
\.


--
-- Data for Name: salary_history; Type: TABLE DATA; Schema: public; Owner: abhishekchaubey
--

COPY public.salary_history (id, employee_id, effective_date, salary, note, created_at) FROM stdin;
\.


--
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: abhishekchaubey
--

SELECT pg_catalog.setval('public.attendance_id_seq', 1, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: abhishekchaubey
--

SELECT pg_catalog.setval('public.departments_id_seq', 5, true);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: abhishekchaubey
--

SELECT pg_catalog.setval('public.employees_id_seq', 11, true);


--
-- Name: leaves_id_seq; Type: SEQUENCE SET; Schema: public; Owner: abhishekchaubey
--

SELECT pg_catalog.setval('public.leaves_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: abhishekchaubey
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: salary_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: abhishekchaubey
--

SELECT pg_catalog.setval('public.salary_history_id_seq', 1, false);


--
-- Name: attendance attendance_employee_id_date_key; Type: CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_employee_id_date_key UNIQUE (employee_id, date);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: employees employees_email_key; Type: CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_email_key UNIQUE (email);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: leaves leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_title_key; Type: CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_title_key UNIQUE (title);


--
-- Name: salary_history salary_history_pkey; Type: CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.salary_history
    ADD CONSTRAINT salary_history_pkey PRIMARY KEY (id);


--
-- Name: idx_attendance_date; Type: INDEX; Schema: public; Owner: abhishekchaubey
--

CREATE INDEX idx_attendance_date ON public.attendance USING btree (date);


--
-- Name: idx_attendance_employee_date; Type: INDEX; Schema: public; Owner: abhishekchaubey
--

CREATE INDEX idx_attendance_employee_date ON public.attendance USING btree (employee_id, date);


--
-- Name: idx_employees_department; Type: INDEX; Schema: public; Owner: abhishekchaubey
--

CREATE INDEX idx_employees_department ON public.employees USING btree (department_id);


--
-- Name: idx_employees_manager; Type: INDEX; Schema: public; Owner: abhishekchaubey
--

CREATE INDEX idx_employees_manager ON public.employees USING btree (manager_id);


--
-- Name: idx_leaves_employee_date; Type: INDEX; Schema: public; Owner: abhishekchaubey
--

CREATE INDEX idx_leaves_employee_date ON public.leaves USING btree (employee_id, start_date, end_date);


--
-- Name: idx_leaves_status; Type: INDEX; Schema: public; Owner: abhishekchaubey
--

CREATE INDEX idx_leaves_status ON public.leaves USING btree (status);


--
-- Name: attendance attendance_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: employees employees_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: employees employees_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(id);


--
-- Name: employees employees_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: departments fk_department_manager; Type: FK CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT fk_department_manager FOREIGN KEY (manager_id) REFERENCES public.employees(id);


--
-- Name: leaves leaves_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.employees(id);


--
-- Name: leaves leaves_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: salary_history salary_history_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: abhishekchaubey
--

ALTER TABLE ONLY public.salary_history
    ADD CONSTRAINT salary_history_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict rhr8yb2WdgoZv7BCBJOQsgmpaXOoatAIsc0mPHDlP4871eaflDCgcq9FVNtJrdx

