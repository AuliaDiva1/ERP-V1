/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import React from 'react';
import '@/styles/gradient.css';

const LoginPage = () => {
    return (
        <div className="min-h-screen flex justify-content-center align-items-center">
            <div className="animated-gradient-bg">
                <div className="card w-10 h-full md:h-30rem">
                    <div className="grid h-full">
                        <div className="col-12 md:col-6 flex flex-col justify-center h-full px-4">
                            <div>
                                <h3 className="text-2xl text-center font-semibold mb-5">{process.env.NEXT_PUBLIC_APP_NAME}</h3>

                                <form className="grid">
                                    <div className="col-12">
                                        <label htmlFor="email">Email</label>
                                        <InputText type="email" className="w-full mt-3" />
                                    </div>
                                    <div className="col-12">
                                        <label htmlFor="password">Password</label>
                                        <InputText type="password" className="w-full mt-3" />
                                    </div>

                                    <div className="col-12 mt-3">
                                        <Button label="login" className="w-full" />
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="hidden md:block md:col-6 h-full">
                            <img src="https://api.minio.jatimprov.go.id/kominfo-jatim/images/e1a81661-d82b-4775-af7a-aaa72616961f.jpg" className="w-full h-full object-cover" alt="cover" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
