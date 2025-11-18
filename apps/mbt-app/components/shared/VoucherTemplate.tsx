"use client";

import React from 'react';

interface VoucherTemplateProps {
  clientName: string;
  hotel: string;
  pax: number;
  time: string;
  date: string;
  company: 'at' | 'st' | 'mbt';
  serviceType: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER';
  flightCode?: string;
}

const VoucherTemplate: React.FC<VoucherTemplateProps> = ({
  clientName,
  hotel,
  pax,
  time,
  date,
  company,
  serviceType,
  flightCode
}) => {
  // Split name for display (first name and surnames)
  const nameParts = clientName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Helper to remove accents for cleaner display
  const removeAccents = (str: string): string => {
    const map: { [key: string]: string } = {
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
      'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
      'ñ': 'n', 'Ñ': 'N'
    };
    return str.replace(/[áéíóúÁÉÍÓÚñÑ]/g, (match) => map[match] || match);
  };

  const cleanFirstName = removeAccents(firstName).toUpperCase();
  const cleanLastName = removeAccents(lastName).toUpperCase();

  // Determine logos and icons based on company and service type
  const getLogo = () => {
    switch (company) {
      case 'st': return '/PDFs/ST_LOGO.png';
      case 'at':
      case 'mbt':
      default: return '/PDFs/LOGO.png';
    }
  };

  const getServiceIcon = () => {
    return serviceType === 'DEPARTURE' ? '/PDFs/SALIDA.png' : '/PDFs/LLEGADA.png';
  };

  const showIdSection = company === 'st';

  return (
    <div 
      className="voucher-container"
      data-voucher="true" 
      style={{
        position: 'relative',
        width: '100vh',
        height: '100vh',                
        backgroundColor: '#FFFFFE',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden',
        padding: 0,
        boxSizing: 'border-box',
        margin: '0',
        border: 'none',
        outline: 'none',
        color: '#000000'
      }}>
      {/* Font Face Declaration */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @font-face {
            font-family: 'Shrikhand';
            src: url('/Shrikhand-Regular.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
        `
      }} />
      {/* Corner decorations */}
      <div style={{
        position: 'absolute',
        right: 0,
        bottom: '60px',
        marginBottom: '300px',
        zIndex: 1,
        width: '22%'
      }}>
        <img src="/PDFs/TOP_RIGHT.png" alt="" style={{ width: '100%', height: 'auto' }} />
      </div>

      <div style={{
        position: 'absolute',
        top: '360px',
        left: 0,
        zIndex: 1,
        width: '22%'
      }}>
        <img src="/PDFs/BOTTOM_LEFT.png" alt="" style={{ width: '100%', height: 'auto' }} />
      </div>

      {/* Background wave */}
      <img 
        src="/PDFs/BG.png" 
        alt=""
        style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          height: '80%',
          zIndex: 0
        }}
      />

      {/* Logo */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <img 
            src={getLogo()}
            alt="Logo"
            style={{
              width: '300px',
              height: '150px',
              marginTop: '30px',
              marginBottom: '10px'
            }}
          />
        </div>
      </div>

      {/* Client Name */}
      <div style={{
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        padding: '30px'
      }}>
        <h1 style={{
          fontFamily: 'Shrikhand, Arial, sans-serif',
          fontSize: '110px',
          fontWeight: 'normal',
          color: '#0B406C',
          textTransform: 'uppercase',
          lineHeight: 0.9,
          letterSpacing: '1px',
          margin: '15px',
          padding: 0,
          textShadow: '2px 2px 0px #0B406C, -2px -2px 0px #0B406C, 2px -2px 0px #0B406C, -2px 2px 0px #0B406C'
        }}>
          {cleanFirstName}
        </h1>
        <h1 style={{
          fontFamily: 'Shrikhand, Arial, sans-serif',
          fontSize: '110px',
          fontWeight: 'normal',
          color: '#0B406C',
          textTransform: 'uppercase',
          lineHeight: 0.9,
          letterSpacing: '1px',
          margin: '15px',
          padding: 0,
          textShadow: '2px 2px 0px #0B406C, -2px -2px 0px #0B406C, 2px -2px 0px #0B406C, -2px 2px 0px #0B406C'
        }}>
          {cleanLastName}
        </h1>
      </div>

      {/* Info Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 60px',
        position: 'relative',
        marginTop: '40px',
        marginLeft: '10px',
        zIndex: 2
      }}>
        {/* ID Section (only visible for ST) */}
        <div style={{  
          maxHeight: '10px',
          width: '42%',
          padding: '60px',          
          marginLeft: '60px',          
          visibility: showIdSection ? 'visible' : 'hidden'
        }}>
          <img src="/PDFs/ID.png" alt="" style={{ width: '100%' }} />
        </div>

        {/* Service Info */}
        <div style={{
          position: 'relative',
          minWidth: '40%',
          maxWidth: '55%',
          backgroundColor: '#DBEEFE',
          borderRadius: '10px',
          padding: '20px',
          marginTop: '60px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '160px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              marginBottom: '4px',
              alignItems: 'center'
            }}>
              <div style={{
                width: '15%',
                minWidth: '70px',
                fontWeight: 900,
                fontSize: '16px'
              }}>
                HOTEL:
              </div>
              <div style={{
                width: '75%',
                fontSize: '16px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {hotel.toUpperCase()}
              </div>
            </div>

            <div style={{
              display: 'flex',
              marginBottom: '4px',
              alignItems: 'center'
            }}>
              <div style={{
                width: '15%',
                minWidth: '70px',
                fontWeight: 900,
                fontSize: '16px'
              }}>
                PAX:
              </div>
              <div style={{
                width: '75%',
                fontSize: '16px'
              }}>
                {pax.toString().padStart(2, '0')}
              </div>
            </div>

            <div style={{
              display: 'flex',
              marginBottom: '4px',
              alignItems: 'center'
            }}>
              <div style={{
                width: '15%',
                minWidth: '70px',
                fontWeight: 900,
                fontSize: '16px'
              }}>
                HOUR:
              </div>
              <div style={{
                width: '75%',
                fontSize: '16px'
              }}>
                {time}
              </div>
            </div>

            {flightCode && (
              <div style={{
                display: serviceType === 'DEPARTURE' ? 'none' : 'flex',
                marginBottom: '4px',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '15%',
                  minWidth: '70px',
                  fontWeight: 900,
                  fontSize: '16px'
                }}>
                  FLIGHT:
                </div>
                <div style={{
                  width: '75%',
                  fontSize: '16px'
                }}>
                  {flightCode}
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              marginBottom: '4px',
              alignItems: 'center'
            }}>
              <div style={{
                width: '15%',
                minWidth: '70px',
                fontWeight: 900,
                fontSize: '16px'
              }}>
                DATE:
              </div>
              <div style={{
                width: '75%',
                fontSize: '16px'
              }}>
                {date}
              </div>
            </div>
          </div>

          {/* Service Icon */}
          <div style={{
            position: 'absolute',
            top: '65px',
            right: '0px',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <img 
              src={getServiceIcon()}
              alt=""
              style={{
                width: '120px',
                height: 'auto'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherTemplate;
