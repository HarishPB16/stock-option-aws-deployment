import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentIQComponent } from './agent-iq.component';

describe('AgentIQComponent', () => {
  let component: AgentIQComponent;
  let fixture: ComponentFixture<AgentIQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentIQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentIQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
