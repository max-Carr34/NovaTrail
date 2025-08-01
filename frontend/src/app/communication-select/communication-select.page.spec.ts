import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationSelectPage } from './communication-select.page';

describe('CommunicationSelectPage', () => {
  let component: CommunicationSelectPage;
  let fixture: ComponentFixture<CommunicationSelectPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationSelectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
